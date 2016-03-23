const Caching = require('../lib/caching'),
	cache = new Caching('memory'), /* use 'memory' or 'redis' */
	key = 'a-key-'+Date.now(),
	ttl = 30 * 1000;

setInterval(function() {
	cache(key, ttl, function(passalong) {
		console.log('This closure runs when nothing is in cache.');
		setTimeout(function() {
			passalong(null, 'cached result with '+ttl+'ms ttl');
		}, 1000);
	}, function(err, results) {
		if (err) {
			console.log(err);
		}
		// This callback will be reused each call
		console.log(new Date().toString().match(/..:..:../)+' - Results:', results);
	});
}, 100);

// If you want to clear the cache manually you can use:
cache.remove(key);