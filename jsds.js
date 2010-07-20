JSDS = {
	
	_stores: {},
	
	create: function(id) {
	    
	    var jsds = this;
	    
        id = id || _randomId();

		function _randomId() {
			var text = "",
				i=0,
				possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
			for(; i < 10; i++ ) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			return text;
		}
		
		/************************************************************************
		/* The JSDataStore class 
		/************************************************************************/
		function JSDataStore(id) {
		    this.s = {};
		    this.listeners = {};
		    this.id = id;
		}
		// public methods
		JSDataStore.prototype.getId = function() {
		    return this.id;
		};
		JSDataStore.prototype.store = function(key, val) {
            var result;
            
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
            
            result = _store(this.s, key, val);
            _fire('store', this, this.listeners);
            return result;
		};
		JSDataStore.prototype.get = function(key) {
			var s = this.s, keys, i=0, j=0, v, result;
			
			if (arguments.length === 1 && key.indexOf('\.') < 0) {
				result = s[key];
			} else {
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

    			result = _getValue(s, keys);
			}
			
			_fire('get', this, this.listeners);
			return result;
		};
		JSDataStore.prototype.on = function(type, fn) {
		    if (!this.listeners[type]) {
		        this.listeners[type] = [];
		    }
		    this.listeners[type].push(fn);
		};
		JSDataStore.prototype.clear = function() {
			this.s = {};
			_fire('clear', this, this.listeners);
		};
		JSDataStore.prototype.remove = function() {
		    this.clear();
		    delete jsds._stores[this.getId()];
		    _fire('remove', this, this.listeners);
		};
		// private methods
		function _fire(type, store, listeners) {
		    var i, ls = listeners[type];
		    if (!ls) { return ; }
		    for (i=0; i<ls.length; i++) {
		        ls[i](type, store, store.getId());
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
		
		function _getValue(store, keys) {
			var key = keys.shift();
			if (store[key][keys[0]]) {
				return _getValue(store[key], keys);
			} else {
				return store[key];
			}
		}
        /************************************************************************
		/* End of JSDataStore class
		/************************************************************************/
		
		if (this._stores[id]) {
			throw new Error('Cannot overwrite existing data store "' + id + '"!');
		}

        this._stores[id] = new JSDataStore(id);
        
		return this._stores[id];
	},
	
	get: function(id) {
		return this._stores[id];
	},
	
	clear: function() {
		this._stores = {};
	}
};