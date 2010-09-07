JSDS.render = function(viewId, storeId) {
	var store = JSDS.get(storeId);
	
	$('#' + viewId).html('<div class="jsds-report">' + processNode(store._s) + '</div>');
	
	function processNode(node) {
		var markup = '', p;
		
		if (typeof node === 'string') {
			markup += '<span class="jsds-content">' + node + '</span>';
		} else {
			markup = '<ul class="jsds-node">'
			for (p in node) {
				if (node.hasOwnProperty(p)) {
					markup += '<li><div class="jsds-node-header">' + p + '</div>';
					markup += processNode(node[p]) + '</li>\n';
				}
			}
			markup += '</ul>\n';
		}
		return markup;
	}
}