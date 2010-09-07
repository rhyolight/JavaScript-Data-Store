(function() {
    var ajax = jQuery.ajax;
    
    jQuery.ajax = function(settings) {
        var store, 
			success = settings.success,
			error = settings.error;
			
		function drill(chunk, target) {
			var pieces;
			if (target.indexOf('.') > 0) {
				pieces = target.split('.');
				return drill(chunk[pieces[0]], pieces.slice(1,pieces.length).join('.'));
			}
			return chunk[target];
		}
		
        if (settings.jsds && settings.jsds.id) {
            settings.success = function(data, status, req) {
				store = JSDS.get(settings.jsds.id);
                if (!store) {
                    store = JSDS.create(settings.jsds.id);
                }
				if (settings.jsds.target) {
					data = drill(data, settings.jsds.target);
				}
                store.store(settings.jsds.key || 'defaultKey', data, {update: true});
				if (success) {
					success(data, status, req);
				}
            };
            settings.error = function(req, status, err) {
                if (error) {
					error(req, status, err);
				}
            };
            settings.dataType = 'json';
        }
        ajax(settings);
    };
    
    jQuery.jsds = {
        on: function (target, opts) {
            JSDS.on(target, opts);
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