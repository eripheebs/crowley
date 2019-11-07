import { expect } from "chai";
import sinon from "sinon";
import { createResourcePool, ResourcePool } from "../resourcePool";
import { createUrlQueue, UrlQueue } from "../queue";
import { Context } from "../index";
import { getSecondsTaken } from "./helpers/getSecondsTaken";
import { generateContext } from "./context.fixtures";
import { createConfig } from "../../config";

export const getContextWithMaxConnections = (
  maxConnections: number
): Context => {
  const config = createConfig({
    maxTimeoutMs: 2000,
    pollIntervalMs: 10,
    maxConnections
  });
  return generateContext({
    config
  });
};

describe("Task Pool", () => {
  let resourcePool: ResourcePool,
    sandbox: sinon.SinonSandbox,
    taskWorkerStub: sinon.SinonStub,
    countStub: sinon.SinonStub,
    context: Context,
    queue: UrlQueue;

  const taskWorker = {
    work: async (_: any) => {}
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    taskWorkerStub = sandbox.stub(taskWorker, "work");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("startTasks", () => {
    beforeEach(() => {
      context = getContextWithMaxConnections(1);
      queue = createUrlQueue(context);
      resourcePool = createResourcePool(context, queue, taskWorker);

      countStub = sandbox.stub(queue, "count");
    });

    it("starts task workers with the next resource until the count is 0 and all workers are free", async () => {
      countStub.returns(0);
      countStub.onCall(0).returns(1);
      countStub.onCall(1).returns(1);

      await resourcePool.startTasks();
      expect(taskWorkerStub.calledOnce).to.be.true;
      expect(taskWorkerStub.calledWith(queue)).to.be.true;
    });

    it("task worker throwing error still releases the resource", async () => {
      countStub.returns(0);
      countStub.onCall(0).returns(1);
      countStub.onCall(1).returns(1);
      taskWorkerStub.throws();
      await resourcePool.startTasks();
      expect(countStub.calledThrice);
    });
  });

  describe("concurrency", () => {
    beforeEach(() => {
      const context = getContextWithMaxConnections(3);
      const queue = createUrlQueue(context);
      resourcePool = createResourcePool(context, queue, taskWorker);

      countStub = sandbox.stub(queue, "count");
    });

    it("only uses up to the max number of connections, then waits to acquire a connection and then starts connecting again when a connection comes free", async () => {
      countStub.returns(0);
      countStub.onCall(0).returns(1); // first count check -> one connection made
      countStub.onCall(1).returns(1);
      countStub.onCall(2).returns(1); // second count check -> 2 connections
      countStub.onCall(3).returns(1);
      countStub.onCall(4).returns(1); // third count check -> 3 connections
      countStub.onCall(5).returns(1);
      countStub.onCall(6).returns(1); // 4th count check ->
      countStub.onCall(7).returns(1);
      // no available connections, an attempt to aquire connection
      // is held at a promise until the next resource is free and then immedietly released
      countStub.onCall(8).returns(1); // 5th count check -> obtained a new connection!
      countStub.onCall(9).returns(1);
      // So 4 connections are made in total.
      // This means we should have a total of 4 queue.GetNext and 4 taskWorker.work() calls

      await resourcePool.startTasks();
      expect(taskWorkerStub.getCalls().length).to.equal(4);
    });

    it("a larger number of max connections will take less time", async () => {
      const contextWithManyConnections = getContextWithMaxConnections(10);
      const queue = createUrlQueue(context);
      const countStubMax = sandbox.stub(queue, "count");
      countStubMax.returns(0);
      countStubMax.onCall(0).returns(1);
      countStubMax.onCall(1).returns(1);
      countStubMax.onCall(2).returns(1);
      countStubMax.onCall(3).returns(1);
      countStubMax.onCall(4).returns(1);
      countStubMax.onCall(5).returns(1);

      const resourcePoolManyC = createResourcePool(
        contextWithManyConnections,
        queue,
        taskWorker
      );

      const contextWithLessConnections = getContextWithMaxConnections(1);
      const queue2 = createUrlQueue(context);
      const countStubLess = sandbox.stub(queue2, "count");
      countStubLess.returns(0);
      countStubLess.onCall(0).returns(1);
      countStubLess.onCall(1).returns(1);
      countStubLess.onCall(2).returns(1);
      countStubLess.onCall(3).returns(1);
      countStubLess.onCall(4).returns(1);
      countStubLess.onCall(5).returns(1);

      const resourcePoolLessC = createResourcePool(
        contextWithLessConnections,
        queue2,
        taskWorker
      );
      const [
        secondsTakenManyConnections,
        secondsTakenFewConnections
      ] = await Promise.all([
        getSecondsTaken(resourcePoolManyC.startTasks),
        getSecondsTaken(resourcePoolLessC.startTasks)
      ]);

      expect(secondsTakenManyConnections < secondsTakenFewConnections).to.be
        .true;
    }).timeout(10000);
  });

  describe("closePool", () => {
    it("should drain and clear the resoure pool", async () => {
      context = getContextWithMaxConnections(1);
      queue = createUrlQueue(context);
      resourcePool = createResourcePool(context, queue, taskWorker);

      await resourcePool.closePool();
      try {
        await resourcePool.testing.pool.acquire();
        expect.fail();
      } catch (err) {
        expect(err.message).to.equal("pool is draining and cannot accept work");
      }
    });
  });
});
