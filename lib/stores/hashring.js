'use strict';

var url = require('url'),
    redis = require('redis'),
    HashRing = require('hashring'),
    util = require('util');

function HashRingStore(options) {

    var i,
        temp,
        servers,
        message;

    if (!(this instanceof HashRingStore)) {
        return new HashRingStore(options);
    }

    switch (typeof options.servers) {
        case 'string':
            servers = options.servers.split(',');
            break;

        case 'object':
            if (Array.isArray(options.servers)) {
                servers = options.servers;
            } else {
                throw new Error('Caching Hash Ring Store requires that servers option be a string or an array. Type was non-array object.');
            }
            break;

        default:
            message = util.format('Caching Hash Ring Store requires that servers option be a string or an array. Type was %s', typeof options.servers);
            throw new Error(message);
            break;
    }

    this.ring = new HashRing(servers, 'md5', options);
    this.client = {};

    for (i = 0; i < servers.length; i++) {
        temp = url.parse(servers[i]);
        this.client[servers[i]] = redis.createClient(temp.port, temp.hostname);
    }
}

HashRingStore.prototype.getClient = function cachingHashRingStoreGetServer(key) {

    var server = this.ring.get(key),
        client = this.client[server];

    return client;
};

HashRingStore.prototype.get = function (key, callback) {
    this.getClient(key).get(key, function (err, result) {
        callback(err, JSON.parse(result));
    });
};

HashRingStore.prototype.set = function (key, ttl, result) {
    if (ttl) {
        this.getClient(key).setex(key, Math.ceil(ttl / 1000), JSON.stringify(result));
    } else {
        this.getClient(key).set(key, JSON.stringify(result));
    }
};

HashRingStore.prototype.remove = function (pattern) {
    if (~pattern.indexOf('*')) {
        var self = this;
        this.getClient(pattern).keys(pattern, function (err, keys) {
            if (keys.length) {
                self.getClient(keys).del(keys);
            }
        });
    } else {
        this.getClient(pattern).del(pattern);
    }
};

module.exports = HashRingStore;
