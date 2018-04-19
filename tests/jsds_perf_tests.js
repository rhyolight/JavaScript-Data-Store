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

        testJSDS_Performance: function() {
            var i, start, end, j, ids =[], vals = [], cnt = 1000;

            for (i=0; i<cnt; i++) {
                ids.push(randomId() + '.' + randomId() + '.' + randomId());
                vals.push(randomId());
            }

            j = JSDS.create('yo');

            start = timer();

            for (i=0; i<ids.length; i++) {
                var v = {values: vals[i], someArray: ['one', 'two', 'three']};
                j.set(ids[i], v, {update: true});
            }

            for (i=0; i<ids.length; i++) {
                j.get(ids[i]);
                j.set(ids[i], randomId(), {update: true});
            }

            end = timer();

            var timeForOne = (end - start)/cnt;
            console.log(timeForOne);

            a.isTrue(timeForOne < 0.5, 'Over ' + cnt + ' times, each count was ' + timeForOne + 'ms, which is higher than the 0.5ms threshhold!');
        }

    }));

    Y.Test.Runner.add(suite);

});
