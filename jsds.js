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
			var result, updatedKeys = [key];
			
			opts = opts || { update: false };
			
			function _store(store, key, val, oldVal /*optional*/) {
				var result, keys, prevKey, currStore, oldKey, oldVal;
				if (key.indexOf('\.') >= 0) {
					keys = key.split('.');
					oldVal = store[keys[0]] ? _clone(store[keys[0]]) : undefined;
					// store[keys[0]] = {};
					oldKey = keys.shift();
					if (store[oldKey] === undefined) {
					    store[oldKey] = {};
					}
					return _store(store[oldKey], keys.join('.'), val, oldVal);
				}
				result = oldVal ? oldVal[key] : store[key];
				// if this is an update, and there is an old value to update
				if (opts.update) {
				    updatedKeys = _update(store, val, key);
				} 
				// if not an update, just overwrite old value
				else {
    				store[key] = val;
				}
				return result;
			}
			
			result = _store(this._s, key, val);
			_fire.call(this, 'store', {keys: updatedKeys, value: val, id: this.id});
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
			
			_fire.call(this, 'get', {keys:[key], value:result});
			return result;
		};
		
		JSDataStore.prototype.on = function() {
			var type = arguments[0], fn, scope, pname, keys;
			if (typeof arguments[1] === 'object') {
				fn = arguments[1].callback;
				scope = arguments[1].scope;
				if (arguments[1].keys) {
					keys = arguments[1].keys;
				} else if (arguments[1].key) {
					keys = [arguments[1].key];
				} else {
					keys = [];
				}
			} else {
				fn = arguments[1];
				scope = arguments[2];
			}
			if (!this._l[type]) {
				this._l[type] = [];
			}
			scope = scope || this;
			this._l[type].push({callback:fn, scope:scope, keys: keys});
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
		    var i, vprop, updatedKeys = [], tmpKeys, newUKey;
		    if (typeof val !== 'object' || val instanceof Array) {
    		    store[key] = val;
    		    updatedKeys.push(key);
		    } else {
    		    for (vprop in val) {
    		        if (val.hasOwnProperty(vprop)) {
    		            updatedKeys.push(key);
    		            if (store[key].hasOwnProperty(vprop)) {
    		                // update existing values
    		                tmpKeys = _update(store[key], val[vprop], vprop);
    		                for (i=0; i<tmpKeys.length; i++) {
    		                    newUKey = key + '.' + tmpKeys[i];
    		                    if (!_arrayContains(updatedKeys, newUKey)) {
    		                        updatedKeys.push(newUKey);
		                        }
    		                }
    		            } else {
    		                // set non-existing values
    		                store[key][vprop] = val[vprop];
    		                updatedKeys.push(key + '.' + vprop);
    		            }
    		        }
    		    }
		    }
		    return updatedKeys
		}
		
		function _arrayContains(arr, val) {
		    var i=0;
		    for (;i<arr.length;i++) {
		        if (arr[i] === val) {
		            return true;
		        }
		    }
		    return false;
		}
		
		function _arrayContainsAny(haystack, needle) {
		    var i=0;
		    for (;i<needle.length; i++) {
		        if (_arrayContains(haystack, needle[i])) {
		            return true;
		        }
		    }
		    return false;
		}
		
		function _fire(type, args) {
			var i, opts, scope, listeners,  
			    localListeners = this._l[type] || [], 
			    staticListeners = JSDS._listeners[type] || [];
			    
			args = args || {};
		    
			// mix local listeners
			listeners = localListeners.concat(staticListeners);
			
			if (listeners.length) {
				for (i=0; i<listeners.length; i++) {
					opts = listeners[i];
					if (opts.key && !opts.keys) {
					    opts.keys = [opts.key];
					}
					if ((!opts.id || opts.id === this.id) && (!opts.keys || !opts.keys.length || _arrayContainsAny(args.keys, opts.keys))) {
		        		scope = opts.scope || this;
		        		opts.callback.call(scope, type, args);    
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