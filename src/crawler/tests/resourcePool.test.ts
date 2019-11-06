import { expect } from "chai";
import sinon from "sinon";
import { createResourcePool, ResourcePool } from "../resourcePool";
import { createConfig } from "../../config/config";
import { generateContext } from "./context.fixtures";
import { createUrlQueue } from "../queue";

const getContextWithMaxConnections = (maxConnections: number) => {
  const config = createConfig({
    resourcePool: {
      maxConnections
    }
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
    getNextStub: sinon.SinonStub;

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
      const context = getContextWithMaxConnections(1);
      const queue = createUrlQueue(context);
      resourcePool = createResourcePool(context, queue, taskWorker);

      countStub = sandbox.stub(queue, "count");
      getNextStub = sandbox.stub(queue, "getNext");
    });

    it("starts task workers with the next resource until the count is 0 and all workers are free", async () => {
      const getNextReturns = "!!! can be anything";
      countStub.returns(0);
      countStub.onCall(0).returns(1);
      countStub.onCall(1).returns(1);

      getNextStub.returns(getNextReturns);

      await resourcePool.startTasks();
      expect(getNextStub.calledOnce).to.be.true;
      expect(taskWorkerStub.calledOnce).to.be.true;
      expect(taskWorkerStub.calledWith(getNextReturns)).to.be.true;
    });
  });

  describe("concurrency", () => {
    beforeEach(() => {
      const context = getContextWithMaxConnections(3);
      const queue = createUrlQueue(context);
      resourcePool = createResourcePool(context, queue, taskWorker);

      countStub = sandbox.stub(queue, "count");
      getNextStub = sandbox.stub(queue, "getNext");
      getNextStub.returns("doesnt matter");
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
      expect(getNextStub.getCalls().length).to.equal(4);
      expect(taskWorkerStub.getCalls().length).to.equal(4);
    });
  });
});
