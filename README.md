JSDS
====

JSDS is a small and fast data store.

    var store = JSDS.create('store-1');

	store.set('cars', {
	    toyota: ['prius', 'avalanche'],
	    honda: ['accord', 'odyssey'],
	    ford: ['taurus', 'fairlane', 'F-150']
	});

    store.get('cars.toyota')[1];
    // 'avalanche'

    // you can add to an existing array using an update option
    store.set('cars.toyota', ['matrix'], {update: true});
    store.get('cars.toyota');
    // ['prius', 'avalanche', 'matrix']

    // add to the structure however you like
    store.set('cars.stats', {
        sold: 242,
        inventory: 4456
    });

    // add to any existing branches on the fly
    store.set('cars.stats.ordered', 30);
    // { sold: 242, inventory: 4456, ordered: 30 }

It allows you to listen for storage events on any branch or leaf within the storage structure.

    var handler = store.after('set', 'cars.stats.ordered', function(result) {
        // cars.stats.ordered was just set... what are you going to do about it?
        // you can change the result that the calling code gets here
        return result * 2;
    };

    store.set('cars.stats.ordered', 30);
    store.get('cars.stats.ordered');
    // the answer is 60 because the listener above doubled it

    // remove the handler
    handler.remove();

    store.set('cars.stats.ordered', 30);
    store.get('cars.stats.ordered');
    // the answer is 30 again. that's better.

    // you can also intercept storage events before they occur
    // (oh yeah, and you can use wildcards)
    handler = store.before('set', 'cars.stats.ordered.*', function(k, v) {
        // will execute any time any property is set onto cars.ordered
        // and you can alter the storing key and value here by returning
        // a new arguments array
        return [k + '-foo', v * 20];
    });

    store.set('cars.stats.blue', 345);
    store.get('cars.stats.blue');
    // undefined ;)
    store.get('cars.stats.blue-foo');
    // 6900

    // back to normal
    handler.remove();

API
---

`JSDS` has a few static functions for creating and managing _stores_, which are the only object that gets create by the JSDS library. Here are some of the static functions:

* `JSDS.create(id)`: Returns new instance of JSDS data store object with the given id. If id is omitted, a random id is assigned.
* `JSDS.get(id)`: Returns an existing JSDS data store with the given id. If a store with the given id does not exist, returns `undefined`
* `JSDS.clear()`: Calls `remove` on all JSDS data stores in memory and resets to en empty list of stores
* `JSDS.count()`: Returns the current number of JSDS data stores that have been created in memory

Each JSDS data store object created will have the following instance properties:

* `id`: The id of the store
* `set(key, value)`: Stores the given value for the given key
* `get(key)`: Retrieves the value for given key, or undefined if it doesn't exist
* `before(event, [optional] key, callback, scope)`: Will call the function registered with original arguments before any action has been taken. You can alter the arguments by returning an array of new arguments. Returns an `handler` object with a `remove()` function, which will remove the listener.
* `after(event, [optional] key, callback, scope)`: Will call the function registered with the result of the action, after action has been taken. You can alter the result with a new return value. Returns an `handler` object with a `remove()` function, which will remove the listener.
* `clear()`: Removes all stored data from the store
* `remove()`: Removes all stored data from the store and deletes store reference within JSDS (for full deletion, any outside references must also be deleted)


AJAX Use Case
-------------

When you make an ajax call, no matter what JavaScript library you might be using, you will supply a callback function that gets executed when the HTTP response is received. Usually, the response object or the data within it is passed directly into your callback, where the callback logic can handle this data.

But sometimes you might not want to couple a response-handling function to logic that fires an ajax request. JSDS provides a generic way to simply cache the data returned in the response so code existing elsewhere can use it when it's ready.

