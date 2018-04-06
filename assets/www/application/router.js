define([
	// These are path alias that we configured in our bootstrap
	'zepto', // zepto
	'Underscore', // lib/underscore/underscore
	'Backbone', // lib/backbone/backbone
	'view/vw01-login',
	'view/vw02-registrazione',
	'view/vw03-home',
	'view/vw04-profile',
	'view/vw05-target',
	'view/vw06-accountstats',
	'view/vw07-globalstats'
], function($, _, Backbone, loginView,registrazioneView, homeView, profileView, targetView, accountstatsView, globalstatsView) {
		var AppRouter = Backbone.Router.extend({
			routes : {
				// definiamo alcuni URL routes
				'' : 'Login',
				'registrazione' : 'Registrazione',
				'home' : 'Home',
				'profile' : 'Profile',
				'target' : 'Target',
				'accountstats' : 'Accountstats',
				'globalstats' : 'Globalstats',
				//Default
				'*actions' : 'Defaultaction'
			},
			Login : function() {
				var view = new loginView();
				$('#zero').html(view.render());		            
			},
			Registrazione : function() {			
				var view = new registrazioneView();
				$('#zero').html(view.render());		
			},
			Home : function() {
				var view = new homeView();
				$('#zero').html(view.render());		            
			},
			Profile : function() {
				var view = new profileView();
				$('#zero').html(view.render());
				console.log(view.render());
			},
			Target : function() {
				var view = new targetView();
				$('#zero').html(view.render());		            
			},
			Accountstats : function() {
				var view = new accountstatsView();
				$('#zero').html(view.render());		            
			},
			Globalstats : function() {
				var view = new globalstatsView();
				$('#zero').html(view.render());		            
			},			
			//Default
			Defaultaction : function(actions) {
				// non so cosa fare perche non matcho con nessuna route! :°(
				console.log('No route:', actions);
			},
			initialize : function() {
				Backbone.history.start();
			}
		});
		return AppRouter;
		// What we return here will be used by other modules
});