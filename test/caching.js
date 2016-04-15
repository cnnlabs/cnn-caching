var util = require('util');

module.exports = function Caching(store, options) {
    store = store || 'memory';
    var path,
        message,
        queues = {},
        cacher;

    if (typeof store == 'string') {
        try {
            path = util.format('../lib/stores/%s', store.toLowerCase().trim());
            console.log(arguments);
            store = require(path)(options);
        } catch (e) {
            message = util.format('There is no test bundled caching store named %s', store);
            throw new Error(message);
        }
    }

    cacher = function (key, ttl, work, done) {
        store.get(key, function (err, args) {
            if (!err && args) {
                done.apply(null, args);
            } else if (queues[key]) {
                queues[key].push(done);
            } else {
                queues[key] = [done];
                work(function () {
                    var args = Array.prototype.slice.call(arguments, 0);
                    store.set(key, ttl, args);
                    queues[key].forEach(function (done) {
                        done.apply(null, args);
                    });
                    delete queues[key];
                });
            }
        });
    };
    cacher.remove = store.remove.bind(store);
    cacher.store = store;

    return cacher;
};