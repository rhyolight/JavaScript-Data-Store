JSDS = {
    
    _stores: {},
    
	create: function(id) {
		var s = {},
		    id = id || _randomId();
		
		if (this._stores[id]) {
            throw new Error('Cannot overwrite existing data store "' + id + '"!');
		}
		
		this._stores[id] = s;
		
		function _getValue(store, keys) {
			var key = keys.shift();
			if (store[key][keys[0]]) {
				return _getValue(store[key], keys);
			} else {
				return store[key];
			}
		}
		
        function _clone(val) {
            var newObj, i, prop;
            if (val instanceof Array) {
                newObj = [];
                for (i=0; i<val.length; i++) {
                    newObj[i] = _clone(val[i]);
                }
            } else if (typeof val === 'object'){
                newObj = {};
                for (prop in val) {
                    if (val.hasOwnProperty(prop)) {
                        newObj[prop] = _clone(val[prop]);
                    }
                }
            } else {
                return val;
            }
            return newObj;
        }
		
		function _store(store, key, val, oldVal /* optional */) {
		    var result, keys, prevKey, currStore, oldKey, oldVal;
		    if (key.indexOf('\.') >= 0) {
		        keys = key.split('.');
		        oldVal = store[keys[0]] ? _clone(store[keys[0]]) : undefined;
		        store[keys[0]] = {};
		        oldKey = keys.shift();
		        return _store(store[oldKey], keys, val, oldVal);
		    }
		    result = oldVal ? oldVal[key] : store[key];
			store[key] = val;
			return result;
		}
		
		function _randomId() {
    	    var text = "",
    	        i=0,
    	        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    	    for(; i < 10; i++ ) {
    	        text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
    	    return text;
    	}
		
		return {
			getId: function() {
				return id;
			},
			store: function(key, val) {
			    return _store(s, key, val);
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
			},
			clear: function() {
			    s = {};
			}
		};
	},
	
    get: function(id) {
        return this._stores[id];
    },
    
    clear: function() {
        this._stores = {};
    }
};