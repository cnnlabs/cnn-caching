var Caching = require('../lib/caching'),
    util = require('util'),
    cache = new Caching('memory'), /* use 'memory' or 'redis' */
    key = util.format('a-key-%s', Date.now()),
    ttl = 30 * 1000,
    message;

setInterval(function () {
    cache(key, ttl, function (passalong) {
        console.log('This closure runs when nothing is in cache.');
        setTimeout(function () {
            message = util.format('cached result with %s ms ttl', ttl);
            passalong(null, message);
        }, 1000);
    }, function (err, results) {
        if (err) {
            console.log(err);
        }
        // This callback will be reused each call
        message = util.format('%s - Results:', new Date().toString().match(/..:..:../), results);
        console.log(message);
    });
}, 100);

// If you want to clear the cache manually you can use:
cache.remove(key);