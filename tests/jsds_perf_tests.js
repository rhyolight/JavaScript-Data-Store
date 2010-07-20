YUI().add('jsds_tests', function(Y) {

    var suite = new Y.Test.Suite("JSDS_Suite"),
    	a = Y.Assert;
    	
    function timer() {
        return new Date().getTime();
    }
    
    function randomId() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	    for( var i=0; i < 5; i++ ) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
	    return text;
	}

    suite.add(new Y.Test.Case({
    
        name : "JSDS Tests",

        setUp : function () {
        },
        
        tearDown : function () {
            JSDS._stores = {};
        },
        
        testStuff: function() {
            var i, start, end, j, ids =[], vals = [];
            
            for (i=0; i<10000; i++) {
                ids.push(randomId() + '.' + randomId() + '.' + randomId());
                vals.push(randomId());
            }
            j = JSDS.create('yo');
            
            start = timer();
            
            for (i=0; i<ids.length; i++) {
                j.store(ids[i], vals[i]);
            }
            
            for (i=0; i<ids.length; i++) {
                j.get(ids[i]);
            }
            
            end = timer();
            
            alert((end - start));
        }
        
    }));
    
    Y.Test.Runner.add(suite);
 
});