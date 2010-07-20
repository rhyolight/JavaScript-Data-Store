JSDS
====

This is a small JavaScript library with no dependencies that helps quickly and easily cache JavaScript values and retrieve them later.

What's the Point?
-----------------

When you make an ajax call, no matter what JavaScript library you might be using, you will supply a callback function that gets executed when the HTTP response is received. Usually, the response object or the data within it is passed directly into your callback, where the callback logic can handle this data.

But sometimes you might not want to couple a response-handling function to logic that fires an ajax request. JSDS provides a generic way to simply cache the data returned in the response so code existing elsewhere can use it when it's ready.

Example
-------

### Register to get JSDS 'store' events

Outside of the logic that actually makes an ajax call, you can have code with the intent to update the DOM only register to receive JSDS events. In this case, my logic wants to be informed anytime a JSDS store called 'ajaxCache' gets data stored inside of it:

	// sometime on page load
	JSDS.create('ajaxCache');
	
	JSDS.on('ajaxCache', 'store', 'ajaxData', function(data) {
		// this gets called any time a JSDS store called 'ajaxCache' has data stored. The data
		// is sent directly here
		renderCityDataIntoDom(data);
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