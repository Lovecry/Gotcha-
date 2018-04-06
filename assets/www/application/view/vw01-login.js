define([
// These are path alias that we configured in our bootstrap
'zepto', // zepto
'Underscore', // lib/underscore/underscore
'Backbone', // lib/backbone/backbone
'Template',
'stackmobinit'
], function ($, _, Backbone, Template, StackMob){	
	loginView = Backbone.View.extend({
		initialize: function () {
			this.render(); 
		},		
		render: function ( ) {
			var template = Template.getLoginTemplate();
			return template();
		},	
	});
	return loginView;
});