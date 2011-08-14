/*
 * Copyright (c) 2010 Matthew A. Taylor
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function() {

    var REGEX_DOT_G = /\./g,
        BSLASH_DOT = '\.',
        REGEX_STAR_G = /\*/g,
        // private functions
        storeIt,
        update,
        mergeArraysIntoSet,
        arrayContains,
        fire,
        listenerApplies,
        getCompleteKey,
        pullOutKeys,
        toRegex,
        valueMatchesKeyString,
        clone,
        getValue,
        randomId;

    /*************************/
    /* The JSDataStore Class */
    /*************************/

    function JSDataStore(id) {
        // data stores
        this._s = {};
        // event listeners
        this._l = {};
        this.id = id;
    }

    JSDataStore.prototype = {

        /**
         * Stores data
         *
         * key {String}: the key to be used to store the data. The same key can be used to retrieve
         *               the data
         * val {Object}: Any value to be stored in the store
         * opts {Object} (optional): options to be used when storing data:
         *                          'update': if true, values already existing within objects and
         *                                    arrays will not be clobbered
         * returns {Object}: The last value stored within specified key or undefined
         *
         * (fires 'store' event)
         */
        store: function(key, val, opts /*optional*/) {
            var result;
            opts = opts || { update: false };
            result = storeIt(this._s, key, opts, val);
            fire.call(this, 'store', {key: key, value: val, id: this.id});
            return result;
        },

        /**
         * Gets data back out of store
         *
         * key {String}: the key of the data you want back
         * returns {Object}: the data or undefined if key doesn't exist
         *
         * (fires 'get' event)
         */
        get: function(key) {
            var s = this._s, keys, i=0, j=0, v, result;

            if (arguments.length === 1 && key.indexOf(BSLASH_DOT) < 0) {
                result = s[key];
            } else {
                if (arguments.length > 1) {
                    keys = [];
                    for (i=0; i<arguments.length; i++) {
                        if (arguments[i].indexOf(BSLASH_DOT) > -1) {
                            var splitKeys = arguments[i].split(BSLASH_DOT);
                            for (j=0; j<splitKeys.length; j++) {
                                keys.push(splitKeys[j]);
                            }
                        } else {
                            keys.push(arguments[i]);
                        }
                    }
                } else if (key.indexOf(BSLASH_DOT) > -1) {
                    keys = key.split(BSLASH_DOT);
                }

                result = getValue(s, keys);
            }

            fire.call(this, 'get', {key:key, value:result});
            return result;
        },

        /**
         * Adds a listener to this store. The listener will be executed when an event of
         * the specified type is emitted and all the conditions defined in the parameters
         * are met.
         *
         * There are 2 options for how parameters are passed into this function:
         *
         * OPTION 1
         * type {String}: the type of event to listen for ('store', 'get', 'clear', etc.)
         * fn {function}: function to be executed on event
         * scope {object}: object to use as the scope of the callback
         *
         * OPTION 2
         * type {String}: the type of event to listen for ('store', 'get', 'clear', etc.)
         * options {object}: an object that contains one or more of the following configurations:
         *                  'callback': the function to be executed
         *                  'scope': the scope object for the callback execution
         *                  'key': the storage key to listen for. If specified only stores into this key will
         *                          cause callback to be executed
         */
        on: function() {
            var type = arguments[0], fn, scope, pname, key;
            if (typeof arguments[1] === 'object') {
                fn = arguments[1].callback;
                scope = arguments[1].scope;
                if (arguments[1].key) {
                    key = arguments[1].key;
                }
            } else {
                fn = arguments[1];
                scope = arguments[2];
            }
            if (!this._l[type]) {
                this._l[type] = [];
            }
            scope = scope || this;
            this._l[type].push({callback:fn, scope:scope, key: key});
            return this; // allow chaining
        },

        /**
         * Removes all data from store
         *
         * (fires 'clear' event)
         */
        clear: function() {
            this._s = {};
            fire.call(this, 'clear');
        },

        /**
         * Removes all internal references to this data store. Note that to entirely release
         * store object for garbage collection, you must also set any local references to the
         * store to null!
         *
         * (fires 'remove' and 'clear' events)
         */
        remove: function() {
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
            delete JSDS._stores[this.id];
            fire.call(this, 'remove');
        }
    };

    /*************************/
    /* Global JSDS namespace */
    /*************************/

    window.JSDS = {

        _stores: {},
        _listeners: {},

        /**
         * Create a new data store object. If no id is specified, a random id will be
         * generated.
         *
         * id {String} (optional): to identify this store for events and later retrieval
         */
        create: function(id) {

            id = id || randomId();

            if (this._stores[id]) {
                throw new Error('Cannot overwrite existing data store "' + id + '"!');
            }

            this._stores[id] = new JSDataStore(id);

            return this._stores[id];
        },

        /**
         * Retrieves an existing data store object by id
         *
         * id {String}: the id of the store to retrieve
         * returns {JSDataStore} the data store
         */
        get: function(id) {
            return this._stores[id];
        },

        /**
         * Removes all data stores objects. Specifically, each JSDataStore object's remove()
         * method is called, and all local references to each are deleted.
         */
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

        /**
         * Returns a count of the existing data stores in memory
         */
        count: function() {
            var cnt = 0, p;
            for (p in this._stores) {
                if (this._stores.hasOwnProperty(p)) {
                    cnt++;
                }
            }
            return cnt;
        },

        /**
         * Returns a list of ids [String] for all data store obects in memory
         */
        ids: function() {
            var id, ids = [];
            for (id in this._stores) {
                if (this._stores.hasOwnProperty(id)) {
                    ids.push(id);
                }
            }
            return ids;
        },

        /**
         * Used to add listeners to potentially any data store objects at once through
         * a static interface. This listener will be executed whenever an event of the
         * specified type is emitted that also matches the conditions in the options
         * parameter.
         *
         * type {String}: the type of event to listen to
         * options {object}: an object that contains one or more of the following configurations:
         *                  'callback': the function to be executed
         *                  'scope': the scope object for the callback execution
         *                  'key': the storage key to listen for. If specified only stores into this key will
         *                          cause callback to be executed
         *                  'keys': list of keys that will cause callback to be executed (overrides 'key' option)
         */
        on: function(type, o) {
            if (!this._listeners[type]) {
                this._listeners[type] = [];
            }
            this._listeners[type].push(o);
        }
    };

    /*****************/
    /* PRIVATE STUFF */
    /*****************/

    // recursive store function
    storeIt = function(store, key, opts, val, oldVal /*optional*/) {
        var result, keys, oldKey;
        if (key.indexOf(BSLASH_DOT) >= 0) {
            keys = key.split('.');
            oldVal = store[keys[0]] ? clone(store[keys[0]]) : undefined;
            oldKey = keys.shift();
            if (store[oldKey] === undefined) {
                store[oldKey] = {};
            }
            return storeIt(store[oldKey], keys.join('.'), opts, val, oldVal);
        }
        result = oldVal ? oldVal[key] : store[key];
        // if this is an update, and there is an old value to update
        if (opts.update) {
            update(store, val, key);
        }
        // if not an update, just overwrite the old value
        else {
            store[key] = val;
        }
        return result;
    };

    // recursive update function used to overwrite values within the store without
    // clobbering properties of objects
    update = function(store, val, key) {
        var vprop;
        if (typeof val !== 'object' || val instanceof Array) {
            if (store[key] && val instanceof Array) {
                mergeArraysIntoSet(store[key], val);
            } else {
                store[key] = val;
            }
        } else {
            for (vprop in val) {
                if (val.hasOwnProperty(vprop)) {
                    if (!store[key]) {
                        store[key] = {};
                    }
                    if (store[key].hasOwnProperty(vprop)) {
                        update(store[key], val[vprop], vprop);
                    } else {
                        store[key][vprop] = val[vprop];
                    }
                }
            }
        }
    };

    // merge two arrays without duplicate values
    mergeArraysIntoSet = function(lhs, rhs) {
        var i=0;
        for (; i<rhs.length; i++) {
            if (!arrayContains(lhs, rhs[i])) {
                lhs.push(rhs[i]);
            }
        }
    };

    // internal utility function
    arrayContains = function(arr, val, comparator /* optional */) {
        var i=0;
        comparator = comparator || function(lhs, rhs) {
            return lhs === rhs;
        };
        for (;i<arr.length;i++) {
            if (comparator(arr[i], val)) {
                return true;
            }
        }
        return false;
    };

    // fire an event of 'type' with included arguments to be passed to listeners functions
    // WARNING: this function must be invoked as fire.call(scope, type, args) because it uses 'this'.
    // The reason is so this function is not publicly exposed on JSDS instances
    fire = function(type, args) {
        var i, opts, scope, listeners, pulledKeys,
            localListeners = this._l[type] || [],
            staticListeners = JSDS._listeners[type] || [];

        // mix local listeners
        listeners = localListeners.concat(staticListeners);

        if (listeners.length) {
            for (i=0; i<listeners.length; i++) {
                opts = listeners[i];
                if (listenerApplies.call(this, opts, args)) {
                    scope = opts.scope || this;
                    if (opts.key && args) {
                        if (opts.key.indexOf('*') >= 0) {
                            pulledKeys = pullOutKeys(args.value);
                            args.value = {};
                            args.value.key = args.key + pulledKeys;
                            args.value.value = getValue(this._s, args.value.key.split('.'));
                        } else {
                            args.value = getValue(this._s, opts.key.split('.'));
                        }
                    }
                    opts.callback.call(scope, type, args);
                }
            }
        }
    };

    // WARNING: this function must be invoked as listenerApplies.call(scope, listener, crit) because it uses 'this'.
    // The reason is so this function is not publicly exposed on JSDS instances
    listenerApplies = function(listener, crit) {
        var result = false, last, lastDot, sub, k, breakout = false;
        if (!listener.key || !crit) {
            return true;
        }
        if (!listener.id || listener.id === this.id) {
            if (!crit.key || crit.key.match(toRegex(listener.key))) {
                return true;
            }
            last = crit.key.length;
            while (!breakout) {
                sub = crit.key.substr(0, last);
                last = sub.lastIndexOf(BSLASH_DOT);
                if (last < 0) {
                    k = sub;
                    breakout = true;
                } else {
                    k = sub.substr(0, last);
                }
                //baseStore = getValue(this._s, crit.key.split('.'));
                if (listener.key.indexOf('*') === 0) {
                    return valueMatchesKeyString(crit.value, listener.key.replace(/\*/, crit.key).substr(crit.key.length + 1));
                } else if (listener.key.indexOf('*') > 0) {
                    var replacedKey = getCompleteKey(crit);
                    return toRegex(replacedKey).match(listener.key);
                }
                return valueMatchesKeyString(crit.value, listener.key.substr(crit.key.length+1));
            }
        }
        return result;
    };

    getCompleteKey = function(o) {
        var val = o.value, key = o.key;
        return key + pullOutKeys(val);
    };

    pullOutKeys = function(v) {
        var p, res = '';
        for (p in v) {
            if (v.hasOwnProperty(p)) {
                res += '.' + p;
                if (typeof v[p] === 'object' && !(v[p] instanceof Array)) {
                    res += pullOutKeys(v[p]);
                }
            }
        }
        return res;
    };

    toRegex = function(s) {
        return s.replace(REGEX_DOT_G, '\\.').replace(REGEX_STAR_G, '\.*');
    };

    valueMatchesKeyString = function(val, key) {
        var p, i=0, keys = key.split('.');
        for (p in val) {
            if (val.hasOwnProperty(p)) {
                if (keys[i] === '*' || p === keys[i]) {
                    if ((typeof val[p] === 'object') && !(val[p] instanceof Array)) {
                        return valueMatchesKeyString(val[p], keys.slice(i+1).join('.'));
                    } else {
                        return true;
                    }
                }
            }
            i++;
        }
        return false;
    };

    // used to copy branches within the store. Object and array friendly
    clone = function(val) {
        var newObj, i, prop;
        if (val instanceof Array) {
            newObj = [];
            for (i=0; i<val.length; i++) {
                newObj[i] = clone(val[i]);
            }
        } else if (typeof val === 'object'){
            newObj = {};
            for (prop in val) {
                if (val.hasOwnProperty(prop)) {
                    newObj[prop] = clone(val[prop]);
                }
            }
        } else {
            return val;
        }
        return newObj;
    };

    // returns a value from a store given an array of keys that is meant to describe depth
    // within the storage tree
    getValue = function(store, keys) {
        var key = keys.shift(), endKey, arrResult, p,
            keysClone;
        if (key === '*') {
            arrResult = [];

            for (p in store) {
                if (store.hasOwnProperty(p)) {
                    keysClone = clone(keys);
                    arrResult.push(getValue(store[p], keysClone));
                }
            }
            return arrResult;
        }
        if (keys[0] && store[key] && (store[key][keys[0]] || keys[0] === '*')) {
            return getValue(store[key], keys);
        } else {
            if (keys.length) {
                endKey = keys[0];
            } else {
                endKey = key;
            }
            return store[endKey];
        }
    };

    randomId = function() {
        var text = "",
            i=0,
            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for(; i < 10; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

}());