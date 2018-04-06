define([
	// These are path alias that we configured in our bootstrap
	'zepto',          // zepto
	'Underscore',     // js/underscore/underscore
	'Backbone',       // js/Backbone/backbone
	'router',
], function($, _, Backbone, Router){
	var initialize = function(){
		var appRouter = new Router();		
	};         
   return {
	   initialize: initialize,
   	}; 
});