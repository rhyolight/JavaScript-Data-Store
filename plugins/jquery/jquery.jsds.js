(function() {
    var ajax = jQuery.ajax;
    
    jQuery.ajax = function(settings) {
        var store;
        if (settings.jsds && settings.jsds.id) {
            settings.success = function(data, status, req) {
                store = JSDS.get(settings.jsds.id);
                if (!store) {
                    store = JSDS.create(settings.jsds.id);
                }
                store.store('defaultKey', data, {update: true});
            };
            settings.error = function(req, status, err) {
                
            };
            settings.dataType = 'json';
        }
        ajax(settings);
    };
    
    jQuery.jsds = {
        on: function (type, opts) {
            JSDS.on('defaultKey.' + type, opts);
        },
		// ugly testing backdoors
		__stealAjax: function() {
			return ajax;
		},
		__replaceAjax: function(ajx) {
			ajax = ajx;
		}
    };
    
})();