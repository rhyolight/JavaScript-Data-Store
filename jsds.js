JSDS = {
	
	_stores: {},
	_listeners: {},
	
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
			this._s = {};
			this._l = {};
			this.id = id;
		}
		// public methods
		JSDataStore.prototype.store = function(key, val, opts /*optional*/) {
			var result;
			
			opts = opts || { update: false };
			
			function _store(store, key, val, oldVal /*optional*/) {
				var result, keys, prevKey, currStore, oldKey, oldVal;
				if (key.indexOf('\.') >= 0) {
					keys = key.split('.');
					oldVal = store[keys[0]] ? _clone(store[keys[0]]) : undefined;
					store[keys[0]] = {};
					oldKey = keys.shift();
					return _store(store[oldKey], keys, val, oldVal);
				}
				result = oldVal ? oldVal[key] : store[key];
				// if this is an update, and there is an old value to update
				if (opts.update && result) {
				    _update(store, val, key);
				} 
				// if not an update, just overwrite old value
				else {
    				store[key] = val;
				}
				return result;
			}
			
			result = _store(this._s, key, val);
			_fire.call(this, 'store', {key: key, value: val, id: this.id});
			return result;
		};
		JSDataStore.prototype.get = function(key) {
			var s = this._s, keys, i=0, j=0, v, result;
			
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
			
			_fire.call(this, 'get', {key:key, value:result});
			return result;
		};
		JSDataStore.prototype.on = function(type, fn, scope) {
			if (!this._l[type]) {
				this._l[type] = [];
			}
			scope = scope || this;
			this._l[type].push({fn:fn, scope:scope});
		};
		JSDataStore.prototype.clear = function() {
			this._s = {};
			_fire.call(this, 'clear');
		};
		JSDataStore.prototype.remove = function() {
		    var ltype, optsArray, opts, i;
			this.clear();
			for (ltype in JSDS._listeners) {
		        if (JSDS._listeners.hasOwnProperty(ltype)) {
		            optsArray = JSDS._listeners[ltype];
		            for (i=0; i<optsArray.length; i++) {
		                opts = optsArray[i];
		                if (!opts.id || opts.id === this.id) {
                    		optsArray.splice(i,1);
		                }
		            }
		        }
		    }
			delete jsds._stores[this.id];
			_fire.call(this, 'remove');
		};
		// private methods
		function _update(store, val, key) {
		    var vprop;
		    if (typeof val !== 'object' || val instanceof Array) {
    		    store[key] = val;
    		    return;
		    }
		    for (vprop in val) {
		        if (val.hasOwnProperty(vprop)) {
		            if (store[key].hasOwnProperty(vprop)) {
		                // update existing values
		                _update(store[key], val[vprop], vprop);
		            } else {
		                // set non-existing values
		                store[key][vprop] = val[vprop];
		            }
		        }
		    }
		}
		function _fire(type, args) {
			var i, ltype, ls = this._l[type], lname, optsArray, opts, scope;
			// local listeners
			if (ls) {
    			args = args || {};
    			for (i=0; i<ls.length; i++) {
    				ls[i].fn.call(ls[i].scope, type, args);
    			}
			}
			// static listeners
			for (ltype in JSDS._listeners) {
		        if (JSDS._listeners.hasOwnProperty(ltype) && type === ltype) {
		            optsArray = JSDS._listeners[ltype];
		            for (i=0; i<optsArray.length; i++) {
		                opts = optsArray[i];
		                if ((!opts.id || opts.id === this.id) && (!opts.key || opts.key === args.key)) {
                    		scope = opts.scope || this;
                    		opts.callback.call(scope, args);    
		                }
		            }
		        }
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
			var key = keys.shift(), endKey;
			if (store[key][keys[0]]) {
				return _getValue(store[key], keys);
			} else {
			    if (keys.length) {
			        endKey = keys[0];
			    } else {
			        endKey = key;
			    }
				return store[endKey];
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
	
	ids: function() {
	    var id, ids = [];
	    for (id in this._stores) {
	        if (this._stores.hasOwnProperty(id)) {
	            ids.push(id);
	        }
	    }
	    return ids;
	},
	
	on: function(type, o) {
	    if (!this._listeners[type]) {
			this._listeners[type] = [];
		}
		this._listeners[type].push(o);
	}
};