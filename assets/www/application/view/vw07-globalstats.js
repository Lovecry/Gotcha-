define([
// These are path alias that we configured in our bootstrap
'zepto', // zepto
'Underscore', // lib/underscore/underscore
'Backbone', // lib/backbone/backbone
'Template',
'stackmobinit',
], function ($, _, Backbone, Template, StackMob){	
	globalstatsView = Backbone.View.extend({
		initialize: function () {
			this.render(); 
		},		
		render: function ( ) {
			var template = Template.getGlobalstatsTemplate();
			return template();
		},
	});
	return globalstatsView;
});