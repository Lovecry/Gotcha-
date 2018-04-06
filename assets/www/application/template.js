define([
	// These are path alias that we configured in our bootstrap
    'zepto',     // zepto
    'Underscore', // lib/underscore/underscore 
    'text!template/sk01-login.html',
    'text!template/sk02-registrazione.html',
    'text!template/sk03-home.html',
    'text!template/sk04-profile.html',
    'text!template/sk05-target.html',
    'text!template/sk06-accountstats.html',
    'text!template/sk07-globalstats.html'
], function($, _, loginTempl, registrazioneTempl, homeTempl, profileTempl, targetTempl, accountstatsTempl, globalstatsTempl){
	var TemplateObj = {		
			
			//Pre-compilazione di tutti i templates utilizzati nell'app  
			loginTemplate : _.template(loginTempl),
			registrazioneTemplate : _.template(registrazioneTempl),
			homeTemplate : _.template(homeTempl),
			profileTemplate : _.template(profileTempl),
			targetTemplate : _.template(targetTempl),
			accountstatsTemplate : _.template(accountstatsTempl),
			globalstatsTemplate : _.template(globalstatsTempl),
			
			//initialize : function(){}, 
			
			//Getter dei templates
			getLoginTemplate : function() {
				return this.loginTemplate;
			},
			getRegistrazioneTemplate : function() {
				return this.registrazioneTemplate;
			},
			getHomeTemplate : function() {
				return this.homeTemplate;
			}, 
			getProfileTemplate : function(){
				return this.profileTemplate;
			},
			getTargetTemplate : function() {
				return this.targetTemplate;
			},
			getAccountstatsTemplate : function() {
				return this.accountstatsTemplate;
			},
			getGlobalstatsTemplate : function() {
				return this.globalstatsTemplate;
			},
			
	}
	return TemplateObj;
});