# crawler

A concurrent web crawler that will produce a sitemap.txt based on a given url :)

#### How it works

The crawler has a queue and a resource pool. When a new URL is found it is added to the queue. The resource pool controls access to the queue. The pool allows workers to acquire MAX_CONNECTIONS to the queue. The pool does not release the connection to the resource until the worker is finished.

In the resource pool, as long as there are unfinished tasks and URLs in the queue, there is a loop checking whether we should add a new worker. This loop gets throttled when all workers are busy by an attempt to acquire a connection. It waits (blocking the loop) until one of the connections are freed. Whenever a connection is released (so there are less than MAX_CONNECTIONS free) if there are still URLs in the queue, the worker will acquire that connection and continue to crawl on the next url :)

When a worker has a connection to a queue, it will write the next available URL to the OUTPUT_FILE_PATH. There is a lock on the file so only one worker can write to it at a time. It will make a request to the URL and try to find other URLs in the body of the response and add URLs we have not visited before to the queue.

When the queue is empty and no outstanding tasks are remaining, the pool is drained.

### Set up:

- install dependencies `yarn` or `npm install`
- compatibility: Use node v 10.15+

#### Via command line:

- start the crawler `yarn start` with defaults

- pass your own config `OUTPUT_FILE_PATH=<file you wanna write to> INITIAL_URL=<a url> MAX_TIMEOUT_MS=<number> MAX_CONNECTIONS=<number> POLL_INTERVAL_MS=<number> yarn start`

#### Via code:

- you can configure your own clients, config etc in the code.

```ts
import { createCrawler } from "./crawler";
import { createClients } from "./clients";
import { createConfig } from "./config";

const clients = createClients();

const config = createConfig({
  initialUrl: "http://woof.com"
  maxTimeoutMs: 10000,
  outputFilePath: "meow.txt",
  maxConnections: 2,
  pollIntervalMs: 100
});

const crawler = createCrawler({
  config,
  clients
});

```

#### Testing

- run `yarn test`

#### File structure

```
.
├── \_index
├── \_crawler
| ├── index
| ├── resourcePool
| ├── queue
| ├── reporter
| ├── parser
| ├── types
| ├── errors
| └── tests
├── config
| ├── index
| └── types
├── clients
| ├── index
| ├── requester
| ├── logger
| ├── types
| └── tests
```
