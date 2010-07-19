YUI().add('jsds_tests', function(Y) {

    var suite = new Y.Test.Suite("JSDS_Suite"),
    	a = Y.Assert;

    suite.add(new Y.Test.Case({
    
        name : "JSDS Tests",

        setUp : function () {
        },
        
        tearDown : function () {
        },
        
        testCreateStore : function () {
        	var store = JSDS.create('store1');
        	
        	a.isNotUndefined(store, 'create returned undefined');
        	a.isNotUndefined(store.getName, 'new store has no getName function');
        	a.isFunction(store.getName, 'new store.getName is not a function');
        	a.areEqual('store1', store.getName(), 'new store returned wrong name');
        	
        	var store2 = JSDS.create('store2');
        	
        	a.areNotSame(store, store2, 'stores created should not be same obj');
        	a.isNotUndefined(store2, 'create returned undefined');
        	a.isNotUndefined(store2.getName, 'new store has no getName function');
        	a.isFunction(store2.getName, 'new store.getName is not a function');
        	a.areEqual('store2', store2.getName(), 'new store returned wrong name');
        	
        },
        
        testStoreStringValue: function () {
        	var jsds = JSDS.create('store1');
        	
        	jsds.store('city', 'Cupertino');
        	
        	var storedValue = jsds.get('city');
        	
        	a.isNotUndefined(storedValue, 'stored value cannot be undefined');
        	a.areEqual('Cupertino', storedValue, 'got back wrong stored value');
        	
        	jsds.store('city', 'San Jose');
        	
        	storedValue = jsds.get('city');
        
        	a.areEqual('San Jose', storedValue, 'got back wrong stored value after reassignment');
        	
        },
        
        testStoreNumberValue: function () {
        	var jsds = JSDS.create('store1');
        	
        	jsds.store('price', 5.55);
        	
        	var storedValue = jsds.get('price');
        	
        	a.isNotUndefined(storedValue, 'stored value cannot be undefined');
        	a.areEqual(5.55, storedValue, 'got back wrong stored value');
        	
        	jsds.store('price', 3.14);
        	
        	storedValue = jsds.get('price');
        
        	a.areEqual(3.14, storedValue, 'got back wrong stored value after reassignment');
        	
        },
        
        testStoreObjectValue: function() {
        	var jsds = JSDS.create('blargh');
        	var chicken = {
        		name: 'Susie', eggs: 3, farm:'Hillsboro Farms'
        	};
        	jsds.store('chicken', chicken);
        	
        	var gotChicken = jsds.get('chicken');
        	
        	a.areSame(chicken, gotChicken, 'retrieved value is not same as set value');
        },
        
        testStoreReturnsUndefinedWhenStoringFirstValue: function() {
        	var jsds = JSDS.create('s');
        	var result = jsds.store('pig', 'Fluffy');
        	a.isUndefined(result, 'store returned a value on initial store');
        },
        
        testStoreReturnsOldValueWhenStoringAnotherValue: function() {
        	var jsds = JSDS.create('s');
        	jsds.store('pig', 'Fluffy');
        	var result = jsds.store('pig', 'Orson');
        	a.areEqual('Fluffy', result, 'store should have returned the old value');
        },
        
        testNamespaceStorage_CombinedDots: function() {
        	var jsds = JSDS.create('s');
        	
        	jsds.store('people', {males: ['Dean', 'Matt']});
        	
        	var result = jsds.get('people.males');
        	
        	a.isArray(result, 'result should have been an array');
        	a.areEqual(2, result.length, 'result should have length of 2');
        	a.areEqual('Dean', result[0]);
        	a.areEqual('Matt', result[1]);
        },
        
        testNamespaceStorage_SeparatedNoDots: function() {
        	var jsds = JSDS.create('s');
        	
        	jsds.store('people', {males: ['Dean', 'Matt']});
        	
        	var result = jsds.get('people', 'males');
        	
        	a.isArray(result, 'result should have been an array');
        	a.areEqual(2, result.length, 'result should have length of 2');
        	a.areEqual('Dean', result[0]);
        	a.areEqual('Matt', result[1]);
        },
        
        testNamespaceStorage_CombinedDots_Deep: function() {
        	var jsds = JSDS.create('s');
        	
        	var val = {
        		animals: {
        			reptiles: {
		        		turtles: ['Victor']
		        	},
		        	mammals: {
		        		primates: {
			        		humans: {
				        		Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
				        	}
			        	},
			        	dogs: ['Sasha', 'Ann-Marie']
		        	}
        		}
        	};
        	
        	jsds.store('stuff', val);
        	
        	var result = jsds.get('stuff');
        	
        	a.isObject(result, 'result should have been an object');
        	
        	result = jsds.get('stuff', 'animals', 'reptiles', 'turtles');
        	a.isArray(result, 'result should have been an array');
        	a.areEqual(1, result.length, 'result should have length of 1');
        	a.areEqual('Victor', result[0]);
        	
        	result = jsds.get('stuff', 'animals', 'mammals', 'primates', 'humans');
        	
        	a.isObject(result, 'result should have been an object');
        	a.areEqual(4, result.Taylors.length, 'result should have length of 4');
        	a.areEqual('Matt', result.Taylors[0]);
        	a.areEqual('Romy', result.Taylors[3]);
        },
        
        testNamespaceStorage_SeparatedNoDots_Deep: function() {
        	var jsds = JSDS.create('s');
        	
        	var val = {
        		animals: {
        			reptiles: {
		        		turtles: ['Victor']
		        	},
		        	mammals: {
		        		primates: {
			        		humans: {
				        		Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
				        	}
			        	},
			        	dogs: ['Sasha', 'Ann-Marie']
		        	}
        		}
        	};
        	
        	jsds.store('stuff', val);
        	
        	var result = jsds.get('stuff');
        	
        	a.isObject(result, 'result should have been an object');
        	
        	result = jsds.get('stuff.animals.reptiles.turtles');
        	a.isArray(result, 'result should have been an array');
        	a.areEqual(1, result.length, 'result should have length of 1');
        	a.areEqual('Victor', result[0]);
        	
        	result = jsds.get('stuff.animals.mammals.primates.humans');
        	
        	a.isObject(result, 'result should have been an object');
        	a.areEqual(4, result.Taylors.length, 'result should have length of 4');
        	a.areEqual('Matt', result.Taylors[0]);
        	a.areEqual('Romy', result.Taylors[3]);
        },
        
        testNamespaceStorage_COMBO_Deep: function() {
        	var jsds = JSDS.create('s');
        	
        	var val = {
        		animals: {
        			reptiles: {
		        		turtles: ['Victor']
		        	},
		        	mammals: {
		        		primates: {
			        		humans: {
				        		Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
				        	}
			        	},
			        	dogs: ['Sasha', 'Ann-Marie']
		        	}
        		}
        	};
        	
        	jsds.store('stuff', val);
        	
        	var result = jsds.get('stuff');
        	
        	a.isObject(result, 'result should have been an object');
        	
        	result = jsds.get('stuff.animals', 'reptiles.turtles');
        	a.isArray(result, 'result should have been an array');
        	a.areEqual(1, result.length, 'result should have length of 1');
        	a.areEqual('Victor', result[0]);
        	
        	result = jsds.get('stuff', 'animals.mammals.primates' , 'humans');
        	
        	a.isObject(result, 'result should have been an object');
        	a.areEqual(4, result.Taylors.length, 'result should have length of 4');
        	a.areEqual('Matt', result.Taylors[0]);
        	a.areEqual('Romy', result.Taylors[3]);
        },
        
        testStoreIntoNonExistantNamespace: function() {
        	a.fail('not implemented');
        },
        
        testClear: function() {
        	a.fail('not implemented');
        },
        
        testDumpToHTML: function() {
        	a.fail('not implemented');
        },
        
        testStoreJson: function() {
        	a.fail('not implemented');
        }
        
    }));
    
    Y.Test.Runner.add(suite);
 
});