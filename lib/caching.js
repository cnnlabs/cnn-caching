var util = require('util');

module.exports = function Caching(store) {
    store = store || 'memory';
    var path,
        message,
        queues = {},
        cacher;

    if (typeof store === 'string') {
        try {
            path = util.format('./stores/%s', store.toLowerCase().trim());
            store = require(path)(arguments[1]);
        } catch (e) {
            message = util.format('There is no bundled caching store named %s', store);
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
                    if (typeof queues[key] !== 'undefined' && queues[key] !== null) {
                        queues[key].forEach(function (done) {
                            done.apply(null, args);
                        });
                    }
                    delete queues[key];
                });
            }
        });
    };
    cacher.remove = store.remove.bind(store);
    cacher.store = store;

    return cacher;
};
