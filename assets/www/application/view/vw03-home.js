define([
// These are path alias that we configured in our bootstrap
'zepto', // zepto
'Underscore', // lib/underscore/underscore
'Backbone', // lib/backbone/backbone
'Template',
'stackmobinit',
'gotchascripts',
], function ($, _, Backbone, Template, StackMob, GotchaScripts){	
	homeView = Backbone.View.extend({
		initialize: function () {
			this.render(); 
		},		
		render: function ( ) {
			var template = Template.getHomeTemplate();
			return template();
		},
	});
	return homeView;
});