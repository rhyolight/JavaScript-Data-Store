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
        },

		test_Success_DataStore_getsExistingStore_andsStoresOnIt_ifItExists: function() {
			var mydata = {pygmies:{tribe:'Ungawanese', size: 23}};
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.success(mydata);
			});
			
			var jsdsmock = Y.Mock(JSDS);
			var storemock = Y.Mock();
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				args: ['parrots'],
				returns: storemock
			});
			
			Y.Mock.expect(storemock, {
				method: 'store',
				args: ['defaultKey', mydata, Y.Mock.Value(function(value) {
					a.isTrue(value.update);
				})]
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots'
                }
            });

			Y.Mock.verify(jsdsmock);
			Y.Mock.verify(storemock);

			JSDS = this.jsds;
			
		},
		
		test_Success_DataStore_StoresUsingProvidedKey: function() {
			var mydata = {pygmies:{tribe:'Ungawanese', size: 23}};
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.success(mydata);
			});
			
			var jsdsmock = Y.Mock(JSDS);
			var storemock = Y.Mock();
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				args: ['parrots'],
				returns: storemock
			});
			
			Y.Mock.expect(storemock, {
				method: 'store',
				args: ['ralphie', mydata, Y.Mock.Value(function(value) {
					a.isTrue(value.update);
				})]
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots',
					key: 'ralphie'
                }
            });

			Y.Mock.verify(jsdsmock);
			Y.Mock.verify(storemock);

			JSDS = this.jsds;
			
		},
		
		test_Success_DataStore_createsNewStore_WhenGetReturnsNull: function() {
			var mydata = {pygmies:{tribe:'Ungawanese', size: 23}};
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.success(mydata);
			});
			
			var jsdsmock = Y.Mock(JSDS);
			var storemock = Y.Mock();
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				args: ['parrots'],
				returns: null
			});
			
			Y.Mock.expect(jsdsmock, {
				method: 'create',
				args: ['parrots'],
				returns: storemock
			});
			
			Y.Mock.expect(storemock, {
				method: 'store',
				args: [Y.Mock.Value.Any,Y.Mock.Value.Any,Y.Mock.Value.Any]
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots'
                }
            });

			Y.Mock.verify(jsdsmock);

			JSDS = this.jsds;
			
		},
		
		test_Success_DataStore_CanTarget_SpecificDataPoint: function() {
			var mydata = {pygmies:{tribe:'Ungawanese', size: 23}};
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.success(mydata);
			});
			
			var jsdsmock = Y.Mock(JSDS);
			var storemock = Y.Mock();
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				args: ['parrots'],
				returns: null
			});
			
			Y.Mock.expect(jsdsmock, {
				method: 'create',
				args: ['parrots'],
				returns: storemock
			});
			
			Y.Mock.expect(storemock, {
				method: 'store',
				args: [Y.Mock.Value.Any, mydata.pygmies, Y.Mock.Value.Any]
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots',
					target: 'pygmies'
                }
            });

			Y.Mock.verify(jsdsmock);

			JSDS = this.jsds;
			
		},
		
		test_Success_DataStore_CanTarget_Specific_Deep_DataPoint: function() {
			var mydata = {pygmies:{tribe:'Ungawanese', size: 23}};
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.success(mydata);
			});
			
			var jsdsmock = Y.Mock(JSDS);
			var storemock = Y.Mock();
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				args: ['parrots'],
				returns: null
			});
			
			Y.Mock.expect(jsdsmock, {
				method: 'create',
				args: ['parrots'],
				returns: storemock
			});
			
			Y.Mock.expect(storemock, {
				method: 'store',
				args: [Y.Mock.Value.Any, 'Ungawanese', Y.Mock.Value.Any]
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots',
					target: 'pygmies.tribe'
                }
            });

			Y.Mock.verify(jsdsmock);

			JSDS = this.jsds;
			
		},
		
		test_Success_Callback_IsExecuted_after_JSDS_storage: function() {
			var stored = false, cbCalled = false,
				mydata = {pygmies:{tribe:'Ungawanese', size: 23}};
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.success(mydata, 'ok', 'fakeReq');
			});
			
			var jsdsmock = Y.Mock(JSDS);
			var storemock = Y.Mock();
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				args: ['parrots'],
				returns: storemock
			});
			
			Y.Mock.expect(storemock, {
				method: 'store',
				args: [Y.Mock.Value.Any,Y.Mock.Value.Any,Y.Mock.Value.Any],
				run: function() {
					stored = true;
				}
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots'
                },
				success: function(data, status, req) {
					a.isTrue(stored, 'success callback called before JSDS store event');
					a.areSame(mydata, data);
					a.areEqual('ok', status);
					a.areEqual('fakeReq', req);
					cbCalled = true;
				}
            });

			Y.Mock.verify(jsdsmock);
			a.isTrue(cbCalled, 'success callback never called');
			
			JSDS = this.jsds;
		},
		
		testErrorCallbackCalledOnError: function() {
			var cbCalled = false;
			
			jQuery.jsds.__replaceAjax(function(opts) {
				opts.error('request', 'status', 'error');
			});
			
			var jsdsmock = Y.Mock(JSDS);
			
			Y.Mock.expect(jsdsmock, {
				method: 'get',
				callCount: 0
			});
			
			this.jsds = JSDS;
			JSDS = jsdsmock;
			
			jQuery.ajax({
				url: '/json.php',
                jsds: {
                    id: 'parrots'
                },
				error: function(req, status, err) {
					a.areEqual('request', req);
					a.areEqual('status', status);
					a.areEqual('error', err);
					cbCalled = true;
				}
            });

			Y.Mock.verify(jsdsmock);
			a.isTrue(cbCalled, 'error callback never called');
			
			JSDS = this.jsds;
		}
        
    }));
    
    Y.Test.Runner.add(suite);
 
});