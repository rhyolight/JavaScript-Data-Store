JSDS = {
	
	_stores: {},
	
	create: function(id) {
		
		var jsds = this;
		
		id = id || _randomId();
		
		if (this._stores[id]) {
			throw new Error('Cannot overwrite existing data store "' + id + '"!');
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
			_fire('store', this.listeners, {key: key, value: val, id: this.id});
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
			
			_fire('get', this.listeners, {key:key, value:result});
			return result;
		};
		JSDataStore.prototype.on = function(type, fn, scope) {
			if (!this.listeners[type]) {
				this.listeners[type] = [];
			}
			scope = scope || this;
			this.listeners[type].push({fn:fn, scope:scope});
		};
		JSDataStore.prototype.clear = function() {
			this.s = {};
			_fire('clear', this.listeners);
		};
		JSDataStore.prototype.remove = function() {
			this.clear();
			delete jsds._stores[this.getId()];
			_fire('remove', this.listeners);
		};
		// private methods
		function _fire(type, listeners, args) {
			var i, ls = listeners[type];
			if (!ls) { return ; }
			args = args || {};
			for (i=0; i<ls.length; i++) {
			    
				ls[i].fn.call(ls[i].scope, type, args);
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
		
		this._stores[id] = new JSDataStore(id);
		
		return this._stores[id];
	},
	
	get: function(id) {
		return this._stores[id];
	},
	
	clear: function() {
		var storeId;
		for (storeId in this._stores) {
			if (this._stores.hasOwnProperty(storeId)) {
				this._stores[storeId].remove();
				delete this._stores[storeId];
			}
		}
		this._stores = {};
	},
	
	count: function() {
		var cnt = 0, p;
		for (p in this._stores) {
			if (this._stores.hasOwnProperty(p)) {
				cnt++;
			}
		}
		return cnt;
	},
	
	on: function() {
	    var type, id, key, fn, sname;
	    
	    // (type, key, fn)
	    if (arguments.length === 3) {
	        type = arguments[0];
	        key = arguments[1];
	        fn = arguments[2];
	    } 
	    // (type, id, key, fn)
	    else if (arguments.length === 4) {
	        type = arguments[0];
	        id = arguments[1];
	        key = arguments[2];
	        fn = arguments[3];
	    }
	    
	    if (!id) {
	        for (sname in this._stores) {
	            if (this._stores.hasOwnProperty(sname)) {
	                this._stores[sname].on(type, function(type, args) {
            			if (args.key === key) {
            				fn(args.value);
            			}
            		});
	            }
	        }
	    } else {
    		this._stores[id].on(type, function(type, args) {
    			if (args.key === key) {
    				fn(args.value);
    			}
    		});
	    }
	}
};