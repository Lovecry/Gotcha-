//inizializziamo StackMob, settiamo Keys

//configuriamo Require
require.config({
	paths: {
		zepto: '../js/Zepto/Zepto-loader',
		Underscore: '../js/underscore/underscore-loader',
		Backbone: '../js/Backbone/Backbone-loader',
		Template: 'template',
		order: '../js/require/order',
		text: '../js/require/text',
		require: '../js/require/require',
		async: '../js/require/async',
		stackmob: '../js/stackmob/stackmob-js-0.9.2-bundled-min',
	    stackmobinit: '../js/stackmob/stackmobinit',
	    gotchascripts: 'scripts/gotchascripts'
	},
	shim: {
	      stackmob: {
	        deps: ['zepto'],
	        exports: "StackMob"
	      },    
	      stackmobinit: {
	        deps: ['zepto','Underscore','Backbone','stackmob'],
	        exports: "StackMobInit"
	      },
	}
});

//require(['fb']);

require([
	// Load our app module and pass it to our definition function
	'app'
 
	// Some plugins have to be loaded in order due to there non AMD compliance
	// Because these scripts are not "modules" they do not pass any values to the definition function below
	// 'order!../libs/jqtouch/jqtouch.min'
],	function(App){
		// The "app" dependency is passed in as "App"
		// Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function

		document.addEventListener("backbutton", function (){
			if(window.location.hash == ('')){
				navigator.app.exitApp();
			}
			else if(window.location.hash == ('#home')){
				navigator.app.exitApp();
			}
			else {
				window.back= true;
				navigator.app.backHistory();
			}
		}, true);
		
		document.addEventListener("deviceready", run, false); 
		
		function run() {
			window.plugins.orientationLock.lock("portrait");
			App.initialize(); 			
		} 
	}
);

