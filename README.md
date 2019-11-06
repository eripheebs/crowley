Worker pool. Pseudo code planning.

1. Have a queue. Urls get added to the queue. pass queue to worker pool to be initialised.
   add, process...

   const factory = {
   create: function() {
   return this.queue = new Queue();
   },
   destroy: function(client) {
   // anything i gotta shut down?
   }
   }
   const myPool = genericPool.createPool(factory, opts);

async start(first link) {
this.queue.add(first link)

    finished = queue.count === 0 && pool.available === pool.size
    while !finished {
      if (pool.available != 0) {
        addWorker()
      }
    }

}

async addWorker () {
const queue = await pool.acquire()
queue.process(function(job, done){

nextUrlInQueue = job.data
await handleUrlInQueue(nextUrlInQueue)

// call done when finished
done();

// or give a error if error (try catch then.)
done(new Error(.......)) (if it errors do we wanna retry?. maybe i'll retry to MAX_RETRIES & add to an error arr.....)

finally:
pool.release(queue)

// If the job throws an unhandled exception it is also handled correctly
});

}

async handleUrlInQueue (url) => {
const response = await request()
if(response.statusCode === 200) {
// Parse the document body finding relative urls.. collect internal links.
// reporter.add(url) [checks the url isnt already added, then adds the url to the sitemap]
// queue.add(url)
}
}

1.5 Worker pool!(https://github.com/coopernurse/node-pool)

2. Create [number] workers concurrently
3. Worker: pops 1st thing off queue, and starts 'working' on it.
4.

maximum pages to visit?
