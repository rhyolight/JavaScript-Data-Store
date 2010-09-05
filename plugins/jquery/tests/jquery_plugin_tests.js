YUI().add('jquery_plugin_tests', function(Y) {

    var suite = new Y.Test.Suite("JSDS_JQuery_Suite"),
    	a = Y.Assert;

    suite.add(new Y.Test.Case({
    
        name : "JSDS jQuery Tests",

        setUp : function () {
			this.ajax = jQuery.jsds.__stealAjax();
        },
        
        tearDown : function () {
			jQuery.jsds.__replaceAjax(this.ajax);
        },
        
        testJQueryAjaxIsCalledWithProperOptions: function() {
	
			var ajaxCalled = false;
			jQuery.jsds.__replaceAjax(function() {
				ajaxCalled = true;
				a.areEqual(1, arguments.length, 'bad arguments length in jQuery.ajax()');
				var opts = arguments[0];
				a.areEqual('/json.php', opts.url);
				a.areEqual('json', opts.dataType);
				a.isFunction(opts.success);
				a.isFunction(opts.error);
				a.isObject(opts.jsds);
				a.areEqual('parrots', opts.jsds.id);
			});
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots'
                }
            });
			
			a.isTrue(ajaxCalled, 'jQuery.ajax() was not called');
        }
        
    }));
    
    Y.Test.Runner.add(suite);
 
});