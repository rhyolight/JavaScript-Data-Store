JSDS
====

This is a small JavaScript library with no dependencies that helps quickly and easily cache JavaScript values and retrieve them later.

What's the Point?
-----------------

When you make an ajax call, no matter what JavaScript library you might be using, you will supply a callback function that gets executed when the HTTP response is received. Usually, the response object or the data within it is passed directly into your callback, where the callback logic can handle this data.

But sometimes you might not want to couple a response-handling function to logic that fires an ajax request. JSDS provides a generic way to simply cache the data returned in the response so code existing elsewhere can use it when it's ready.

What Can JSDS Do?
-----------------

JSDS has a few static functions for creating and managing _stores_, which are the only object that gets create by the JSDS library. Here are some of the static functions:

* `create(id)`: Returns new instance of JSDS data store object with the given id. If id is omitted, a random id is assigned.
* `get(id)`: Returns an existing JSDS data store with the given id. If a store with the given id does not exist, returns `undefined`
* `clear()`: Calls `remove` on all JSDS data stores in memory and resets to en empty list of stores
* `count()`: Returns the current number of JSDS data stores that have been created in memory
* `on(id, type, key, callback)`: Attaches given function as event handler for the specified type of event (store, get, clear, or remove). Callback is only called when the specified key is acted upon.

Each JSDS data store object created will have the following instance properties:

* `id`: The id of the store
* `store(key, value)`: Stores the given value for the given key
* `get(key)`: Retrieves the value for given key, or undefined if it doesn't exist
* `on(type, callback)`: Attaches given function as event handler for the specified type of event (store, get, clear, or remove). Callback is passed different parameters depending on the type of event.
* `clear()`: Removes all stored data from the store
* `remove()`: Removes all stored data from the store and deletes store reference within JSDS (for full deletion, any outside references must also be deleted)

Example
-------

### Register to get JSDS 'store' events

Outside of the logic that actually makes an ajax call, you can have code with the intent to update the DOM only register to receive JSDS events. In this case, my logic wants to be informed anytime a JSDS store called 'ajaxCache' gets data stored inside of it:

	// sometime on page load
	JSDS.create('ajaxCache');
	
	JSDS.on('store', {
	    id: 'ajaxCache', 
	    key: 'ajaxData', 
	    callback: function(data) {
		    // this gets called any time a JSDS store called 'ajaxCache' has data stored under the key 'ajaxData'. 
		    // The data is sent directly here, within an object with a 'key' and 'value'
		    renderCityDataIntoDom(data.value);
	    }
	});
	
	// meanwhile, in some DOM event handler that causes an ajax event...
	$.get({
		url: '/getCityData/json'
		success: function(resp) {
			// assuming the resp at this point is an evaluated JSON object
			JSDS.get('ajaxCache').store('ajaxData', resp);
		},
		dataType: 'json'
	});

This allows you to set up a generic ajax proxy that always executes the same callback function. That function just stores the returned JSON object into JSDS. Anything that has registered to receive events from JSDS will get this data sent directly to them. This allows you to add more JavaScript modules onto your page and sign them up to receive any data being returned through the ajax proxy without attaching a new callback in some DOM event handler. This way, the DOM event handler is generic and calls the ajax proxy without providing callback logic. When the response is received, JSDS fires the response data to any component that has registered to listen.

### Using Instances

It is just as easy to return instances of JSDS objects into local variables. Then you can listen for events coming from individual stores by calling `on` on them.

	var myStore = JSDS.create('my store');
	
	myStore.on('store', 'cityData', function(type, data) {
		var storedValue = data.value;
	});
	
