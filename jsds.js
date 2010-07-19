JSDS = {
	create: function(name) {
		var s = {};
		
		function _getValue(store, keys) {
			var key = keys.shift();
			if (store[key][keys[0]]) {
				return _getValue(store[key], keys);
			} else {
				return store[key];
			}
		}
		
		return {
			getName: function() {
				return name;
			},
			store: function(key, val) {
				var result = s[key];
				s[key] = val;
				return result;
			},
			get: function(key) {
				var keys, i=0, j=0, v;
				
				if (arguments.length === 1 && key.indexOf('\.') < 0) {
					return s[key];
				}
				
				if (arguments.length > 1) {
					keys = [];
					for (i=0; i<arguments.length; i++) {
						if (arguments[i].indexOf('\.') > -1) {
							var splitKeys = arguments[i].split('\.');
							for (j=0; j<splitKeys.length; j++) {
								keys.push(splitKeys[j]);
							}
						} else {
							keys.push(arguments[i]);
						}
					}
				} else if (key.indexOf('\.') > -1) {
					keys = key.split('\.');
				}
				
				return _getValue(s, keys);
			}
		};
	}
};