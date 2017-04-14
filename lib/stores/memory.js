function MemoryStore(opts) {
    if (!(this instanceof MemoryStore)) {
        return new MemoryStore;
    }

    this.cache = {};
    this.minTtl = (opts && typeof opts.minTtl === 'number' && opts.minTtl > 0) ? opts.minTtl : 0;
}

MemoryStore.prototype.get = function (key, callback) {
    var self = this;
    process.nextTick(function () {
        callback(null, self.cache[key] || null);
    });
};

MemoryStore.prototype.set = function (key, ttl, result) {
    var self = this;
    if (ttl) {
        if (ttl >= self.minTtl) {
            self.cache[key] = result;
            setTimeout(function () {
                delete self.cache[key];
            }, ttl);
        } // else do nothing, not above minTtl threshold for caching!!!
    } else {
        self.cache[key] = result;
    }
};

MemoryStore.prototype.remove = function (pattern) {
    if (~pattern.indexOf('*')) {
        var self = this;
        pattern = new RegExp(pattern.replace(/\*/g, '.*'), 'g');
        Object.keys(this.cache).forEach(function (key) {
            if (pattern.test(key)) {
                delete self.cache[key];
            }
        });
    } else {
        delete this.cache[pattern];
    }
};

module.exports = MemoryStore;
