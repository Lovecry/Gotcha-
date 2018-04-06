var gotchacamera = {
	sourcePage : null,
	pictureSource : navigator.camera.PictureSourceType,
	destinationType : navigator.camera.DestinationType,
	direction : navigator.camera.Direction,
	onPhotoDataSuccess : function(imageData) {
		var smallImage = null;
		if (gotchacamera.sourcePage == 'change') {
			smallImage = document.getElementById('avatar')
		} else {
			smallImage = document.getElementById('targetAvatar')
		}
	    smallImage.style.display = 'block';
		smallImage.src = "data:image/jpeg;base64," + imageData;
		gotchaRegistrazione.registrationPhoto = imageData;
		if (gotchacamera.sourcePage == 'change') {
			$('#homephoto').children('img').css('display', 'inline');
	  		$('#homephoto').children('button').css('display', 'none');
			gotchaHome.saveAvatar(imageData)
		}
	},
	onFail : function(message){
	      alert('Failed because: ' + message);
    },
    capturePhoto : function(source) {
    	this.sourcePage = source;
    	navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, { 
    		quality: 50,
    		destinationType : this.destinationType.DATA_URL,
    		correctOrientation: true
    	});
    },
    getPhoto : function(sourceKey) {
    	gotchacamera.sourcePage = sourceKey;
    	var source;
    	if (sourceKey=='photolibrary' || sourceKey=='change') {source = gotchacamera.pictureSource.PHOTOLIBRARY} 
    	else if (sourceKey=='savedphotoalbum') {source = gotchacamera.pictureSource.SAVEDPHOTOALBUM}
    	navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, { 
    		quality: 50,
    		destinationType: gotchacamera.destinationType.DATA_URL,
    		sourceType: source,
    		correctOrientation: true
    	});
    },
	
}

var gotchapopup = {
	show : function() {
		$('#popupbackground').css({'display': 'block', opacity: 0.80, 'width':$(document).width(),'height':$(document).height()});
		$('span.pointer').css({'z-index': '0'});
		$('span').css({'z-index': '0'});
		$('header').css({'display' : 'none'});
		$('#popup').css({'display': 'block'}).click(function(){
														$(this).css('display', 'none');
														$('#popupbackground').css('display', 'none');
														$('span').css({'z-index': '2'});
														$('span.pointer').css({'z-index': '1'});
														$('header').css({'display' : 'block'})
													});
	},
	
	waitingshow : function() {
		$('#popupbackground').css({'display': 'block', opacity: 0.80, 'width':$(document).width(),'height':$(document).height()});
		$('#popupwaiting').css({'display': 'block'});
	},
	
	waitinghide : function() {
		$('#popupbackground').css({'display': 'none'});
		$('#popupwaiting').css({'display': 'none'});
	}
	
}

var gotchaRegistrazione = {
	registrationPhoto : null,
	registrationCheckData : function() {
		gotchapopup.waitingshow();
		var userPhoto = this.registrationPhoto;
		var userEmail = document.formregistrazione.email.value;
		var userUsername = document.formregistrazione.username.value;
		var userPassword = document.formregistrazione.password.value;
		var passwordConfirm = document.formregistrazione.passwordconfirm.value;		
		//Controlla campi vuoti
		if (userEmail=="" || userUsername=="" || userPassword=="" || passwordConfirm=="") {
			this.registrationError("fieldEmpty");
			return;
		}
		//Controlla corrispondenza password
		if (userPassword!=passwordConfirm) {
			this.registrationError("passwordMismatch");
			return;
		}
		//Controlla l'esistena di email e username sul database
		var stackmobQuerySameUsername = new StackMob.Collection.Query().equals('username', userUsername);
		var stackmobQuerySameEmail = new StackMob.Collection.Query().equals('email', userEmail);
		var users = new StackMob.Users();
		users.query(stackmobQuerySameUsername.or(stackmobQuerySameEmail), {
			  success: function(collection) {
				  var result = (collection.toJSON());
				  if (result.length == 0){
					  gotchaRegistrazione.registrationCreateAccount(userEmail, userUsername, userPassword, userPhoto);
				  } else{
					  if (result[0].email == userEmail) {
						  gotchaRegistrazione.registrationError("emailExists");
						  return;
					  }
					  if (result[0].username == userUsername){
						  gotchaRegistrazione.registrationError("usernameExists");
						  return;
					  }
				  }
			  }
		});
	},
	
	registrationCreateAccount : function(userEmail, userUsername, userPassword, userPhoto){
		var userModel = StackMob.Model.extend({ schemaName: 'user' });
		var user = new userModel({ email : userEmail, username : userUsername, password : userPassword, score : 0, targetscore : 0, reward : 0, gotcha : 0  });	
		if(userPhoto!=null){user.setBinaryFile('photo', userUsername, 'jpeg', userPhoto);}
		user.save({}, {
		  success: function(model, result, options) {
			  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
			  var session = new sessionModel({ username : userUsername, closed : false });	
			  session.create();
			  gotchapopup.waitinghide();
			  alert('Congratulazioni! Hai creato il tuo account, puoi effettuare il Login');
			  window.location.href = '';
		  },
		  error: function(model, result, options) {
			  gotchapopup.waitinghide();
			  alert('Update problem');
		  }
		});
	},
	
	registrationError : function(type) {
		gotchapopup.waitinghide();
		var errormessage = "";
		var formField = null;
		switch(type) {
			case "emailExists" :
				errormessage = 'La email selezionata sembra gia in uso, utilizzarne una diversa';
				formField = document.formregistrazione.email;
				break;
			case "usernameExists" :
				errormessage = 'Username gia in uso, sceglierne uno diverso';
				formField = document.formregistrazione.username;
				break;
			case "passwordMismatch" :
				errormessage = 'La password confermata sembra diversa da quella scelta, ricontrollare';
				formField = document.formregistrazione.passwordconfirm;
				break;
			case "fieldEmpty" :
				errormessage = 'Tutti i campi sono obbligatori, ricontrollare';
				break;
		}
		$('#popuperror').css({'display': 'block'}).html(errormessage);
		$('#taptoback').css({'display': 'block'}).html('Tap to back');
		$('#popuperror').unbind( "click" );
		$('#popuperror').click(function() {
									$(this).css('display', 'none');
									$('#taptoback').css({'display': 'none'});
									if (formField!=null) formField.value = "";						
								});	
		$('#taptoback').unbind( "click" );
		$('#taptoback').click(function() {
									$('#popuperror').css('display', 'none');
									$('#taptoback').css({'display': 'none'});
									if (formField!=null) formField.value = "";						
		});
	}
}

var gotchaLogin = {
		loginCheckData : function() {		
			gotchapopup.waitingshow();
			var userUsername = document.formLogin.username.value;
			var userPassword = document.formLogin.password.value;
			//Controlla campi vuoti
			if (userUsername=="" || userPassword=="") {
				this.loginError("fieldEmpty");
				return;
			}
			//Effettua il Login			
			var user = new StackMob.User({ username : userUsername, password : userPassword });		 
			user.login(false, {
			  success: function(model, result, options) {gotchapopup.waitinghide();window.location.href = '#home';},
			  error: function(model, result, options) {gotchaLogin.loginError("dataMismatch");}
			});
		},
		
		loginError : function(type) {
			gotchapopup.waitinghide();
			var errormessage = "";
			switch(type) {
				case "dataMismatch" :
					errormessage = 'Username o Password errate, ricontrollare';
					break;
				case "fieldEmpty" :
					errormessage = 'Tutti i campi sono obbligatori, ricontrollare';
					break;
				case "noUsername" :
					errormessage = 'Inserisci il tuo username per una password temporanea';
					break;
				case "passSent" :
					errormessage = 'Una Password temporanea è stata inviata al tuo indirizzo email';
					break;
			}
			$('#popuperror').css({'display': 'block'}).html(errormessage);
			$('#taptoback').css({'display': 'block'}).html('Tap to back');
			$('#popuperror').unbind( "click" );
			$('#popuperror').click(function() {
										$(this).css('display', 'none');
										$('#taptoback').css({'display': 'none'});
									});	
			$('#taptoback').unbind( "click" );
			$('#taptoback').click(function() {
										$('#popuperror').css('display', 'none');
										$('#taptoback').css({'display': 'none'});
			});
		},
		
		forgotPassword : function(){
			var userUsername = document.formLogin.username.value;
			if (userUsername=="") {
				this.loginError("noUsername");
				return;
			}
			else{
				var user = new StackMob.User({ username: userUsername });
				user.forgotPassword();
				this.loginError("passSent");
				return;
			}
		},
		
		loginTempPasswordForm : function(){
			$('#popupGeneralBackground').css({'display': 'block', opacity: 1, 'width':$(document).width(),'height':$(document).height()}).click(function(){
																																			$(this).css('display', 'none');
																																			$('#popupGeneral').css('display', 'none');
																																		});
			$('#popupGeneral').css({'display': 'block'}).html(''
					+'<div class="home_window">'
					+'<div class="label">Login with temporary password</div>'
					+'<form id="tempPasswordForm" method="post" name="tempPasswordForm">'
					+'	<input id="usernameInput" name="username" type="text" placeholder="Username"> <br/>'
					+'	<input id="tempPasswordInput" name="tempPassword" type="password" placeholder="Temp Password"> <br/>'
					+'	<input id="newPasswordInput" name="newPassword" type="password" placeholder="New Password">'
					+'</form>'
					+'<div class="buttons">'
					+'	<a class="button big" onclick="gotchaLogin.loginTempPassword();return false;"">Login</a>'
					+'</div>'
					+'</div>');
		},
		
		loginTempPassword : function(){
			var userUsername = document.tempPasswordForm.username.value;
			var tempPassword = document.tempPasswordForm.tempPassword.value;
			var newPassword = document.tempPasswordForm.newPassword.value;
			//Controlla campi vuoti
			if (userUsername=="" || tempPassword=="" || newPassword=="") {
				this.loginError("fieldEmpty");
				return;
			}
			//Effettua il Login			
			var user = new StackMob.User({ username : userUsername });	
			user.loginWithTempAndSetNewPassword(tempPassword, newPassword, true,{
				  success: function(model) {},
				  error: function(model, response) {}
				});
			var aa = StackMob.getLoggedInUser();
			if (StackMob.getLoggedInUser() == userUsername) {window.location.href = '#home';}
			else {window.location.href = '';}
		}
		
		
		
		
//		facebookLogin : function() {
//			FB.login(function(response) {
//				alert('Ok');
//
//			  if (response.authResponse) {
//			    var accessToken = response.authResponse.accessToken;
//			    var user = new StackMob.User();
//			    user.loginWithFacebookAutoCreate(accessToken, false);
//			    alert(accessToken);
//			  } else {
//			    console.log('User cancelled login or did not fully authorize.');
//			  }
//			}, {scope: 'email'});
//		}
	}


var gotchaUser = {
	callbacks : {success : function(result){}},
	loadData : function(callbacks) {
		this.callbacks=callbacks;
		var user = new StackMob.User();	
		user.isLoggedIn({
			  yes: function(username){
				gotchaUser.setData(username);
			  },
			  no: function(){
			    console.log("Not logged in.");
			  }
		});	
	},
	
	setData : function(username) {
		var stackmobQuery = new StackMob.Collection.Query().equals('username', username);
		var users = new StackMob.Users();
		users.query(stackmobQuery, {
			  success: function(collection) {
				  var result = (collection.toJSON());
				  gotchaUser.callbacks.success(result[0]);
			  }
		});
	}
}

var gotchaUserTarget = {
		callbacks : {success : function(result){}},
		loadData : function(callbacks,destin) {
			this.callbacks=callbacks;
			var user = new StackMob.User();
			user.isLoggedIn({
				  yes: function(username){
					  	var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
					  	var session = new sessionModel();
					  	var stackmobQuery = new StackMob.Collection.Query().equals('username', username).notEquals('closed', true).setRange(0,0);
						session.query(stackmobQuery, {
							  success: function(collection) {
								  var result = (collection.toJSON());
								  if (destin=='targetProfile') { //Qui stiamo caricando le info del Target
									  var stackmobQuery = new StackMob.Collection.Query().equals('username', result[0].target);
									  var users = new StackMob.Users();
									  users.query(stackmobQuery, {
										  success: function(collection) {
											  var result = (collection.toJSON());
											  gotchaUserTarget.callbacks.success(result[0]);
										  }
									});
								  }
								  else {
									  gotchaUserTarget.callbacks.success(result[0]); //Qui stiamo caricando le info della sessione dell'utente loggato
								  }
							  }
						});
				  },
				  no: function(){
				    console.log("Not logged in.");
				  }
			});	
		}
}

var gotchaHome = {
	
	profiloCompleto : false,
	targetAssegnato : false,
	usersOnline: false,
		
	loadUserData : function() {
		$(document).ready(function() {
			gotchapopup.waitingshow();
			gotchascripts.getCoords();
			gotchaUser.loadData({
				success : function(result) {
					gotchaHome.targetAssegnato=false;
					$('#accountname').html(result.username);
					$('#accountpoints').html(result.score);
					if (result.photo!=null){$('#home_userphoto').children('img').attr('src', result.photo);}
					$('#homeaccountgotcha').html(result.gotcha);
					if (result.eyescolor!=null && result.firstname!=null && result.haircolor!=null && result.height!=null && result.signs1!=null && result.signs2!=null && result.zone1!=null && result.zone2!=null && result.photo!=null) {
						gotchaHome.profiloCompleto = true;
					}
					var stackmobQuery = new StackMob.Collection.Query().gt('score',result.score).orderAsc('score');
					var user= new StackMob.User();
					user.query(stackmobQuery, {
						success: function(collection) {
							var resultRank = (collection.toJSON());
							var count=0;
							for (var playerRank in resultRank) {count++}
							$('#accountrank').html(count+1);
							var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
						  	var session = new sessionModel();
						  	var stackmobQuery = new StackMob.Collection.Query().equals('username', result.username).notEquals('closed', true).setRange(0,0);
							session.query(stackmobQuery, {
							  success: function(collection) {
								  var resultZone = (collection.toJSON());
								  if (resultZone[0].gamingkey1==null){$('#homegamezonekey1').html("1 - Tap to add zone");}
								  else {$('#homegamezonekey1').html("1 - "+resultZone[0].gamingkey1);}
								  if (resultZone[0].gamingkey2==null){$('#homegamezonekey2').html("2 - Tap to add zone");}
								  else {$('#homegamezonekey2').html("2 - "+resultZone[0].gamingkey2);}
								  if (resultZone[0].gamingkey3==null){$('#homegamezonekey3').html("3 - Tap to add zone");}
								  else {$('#homegamezonekey3').html("3 - "+resultZone[0].gamingkey3);}
								  if (resultZone[0].gamingkey4==null){$('#homegamezonekey4').html("4 - Tap to add zone");}
								  else {$('#homegamezonekey4').html("4 - "+resultZone[0].gamingkey4);}
								  if (resultZone[0].gamingkey5==null){$('#homegamezonekey5').html("5 - Tap to add zone");}
								  else {$('#homegamezonekey5').html("5 - "+resultZone[0].gamingkey5);}
								  if (resultZone[0].target=='' || resultZone[0].target==null) {$('#home_gametarget').css('display','none');} 
								  else {
									  var user = new StackMob.User({ username: resultZone[0].target });
							          user.fetch({
							        	  success: function(collection) {
							        		  result = collection.toJSON();
							        		  if (result.photo!=null){$('#targetAvatar').attr('src', result.photo);}
									          $('#home_gametarget > #home_userdetails > #accountname').html(result.username);
									          $('#targetAccountpoints').html(result.score);
									          $('#targetAccounreward').html(result.reward);
							        	  }
							          });
								  }
								  if (resultZone[0].target!='' && resultZone[0].target!=null){gotchaHome.targetAssegnato=true}
								  if (gotchaHome.profiloCompleto==true && gotchaHome.targetAssegnato==false){
									$('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');
									$('#homeGameReadyButton').attr('onclick','gotchaHome.selectTarget()');
								  }
								  else if (gotchaHome.profiloCompleto==true && gotchaHome.targetAssegnato==true){
									$('#homeGameReadyButton').html('I can not find my target, i lose this hard. Please give me another target'); 
									$('#homeGameReadyButton').attr('onclick','gotchaHome.selectTarget()');
									$('a.linktarget').css('display','block');
								  }
								  else {
									  $('#homeGameReadyButton').attr('onclick','').unbind('click');
								  }
								  var stackmobQueryKey1 = new StackMob.Collection.Query().mustBeOneOf('gamingkey1', [resultZone[0].gamingkey1,resultZone[0].gamingkey2,resultZone[0].gamingkey3,resultZone[0].gamingkey4,resultZone[0].gamingkey5]);
								  var stackmobQueryKey2 = new StackMob.Collection.Query().mustBeOneOf('gamingkey2', [resultZone[0].gamingkey1,resultZone[0].gamingkey2,resultZone[0].gamingkey3,resultZone[0].gamingkey4,resultZone[0].gamingkey5]);
								  var stackmobQueryKey3 = new StackMob.Collection.Query().mustBeOneOf('gamingkey3', [resultZone[0].gamingkey1,resultZone[0].gamingkey2,resultZone[0].gamingkey3,resultZone[0].gamingkey4,resultZone[0].gamingkey5]);
								  var stackmobQueryKey4 = new StackMob.Collection.Query().mustBeOneOf('gamingkey4', [resultZone[0].gamingkey1,resultZone[0].gamingkey2,resultZone[0].gamingkey3,resultZone[0].gamingkey4,resultZone[0].gamingkey5]);
								  var stackmobQueryKey5 = new StackMob.Collection.Query().mustBeOneOf('gamingkey5', [resultZone[0].gamingkey1,resultZone[0].gamingkey2,resultZone[0].gamingkey3,resultZone[0].gamingkey4,resultZone[0].gamingkey5]);
								  var stackmobQueryUsername = new StackMob.Collection.Query().notEquals('username', resultZone[0].username);
								  var stackmobQueryClosed = new StackMob.Collection.Query().notEquals('closed', true);
								  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
								  var session = new sessionModel();
								  session.query(stackmobQueryKey1.or(stackmobQueryKey2).or(stackmobQueryKey3).or(stackmobQueryKey4).or(stackmobQueryKey5).and(stackmobQueryClosed).and(stackmobQueryUsername), {
									  success: function(collection) {
										  var resultTarget = (collection.toJSON());
						  				  var playersOnline=0;
						  				  for (var playerSession in resultTarget) {playersOnline++}
						  				  $('#homegameplayers').html(playersOnline);
						  				  if (playersOnline==0){
						  					$('#homeGameReadyButton').html('Seems noone in these areas, i need to add some new keywords!!'); 
						  					$('#homeGameReadyButton').attr('onclick','').unbind('click');
						  				  }
						  				  else {
						  					  gotchaHome.usersOnline=true;
											  if (gotchaHome.profiloCompleto==true && gotchaHome.targetAssegnato==false){
													$('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');
													$('#homeGameReadyButton').attr('onclick','gotchaHome.selectTarget()');
												  }
												  else if (gotchaHome.profiloCompleto==true && gotchaHome.targetAssegnato==true){
													$('#homeGameReadyButton').html('I can not find my target, i lose this hard. Please give me another target'); 
													$('#homeGameReadyButton').attr('onclick','gotchaHome.selectTarget()');
													$('a.linktarget').css('display','block');
												  }
												  else {
													  $('#homeGameReadyButton').html('I Should complete my profile input before i can ask for a target'); 
													  $('#homeGameReadyButton').attr('onclick','').unbind('click');
												  }
						  				  }
						  				  gotchapopup.waitinghide();
						  			  }
								  });
							  }
							});
						}
					});
				}
			});
		});
	},
	
	changePhoto : function() {
		$('#home_userphoto_buttons').css('display', 'block');
		$('#home_userphoto_buttons').children('a').css('display', 'block');
	},
	
	noChange : function() {
		$('#home_userphoto_buttons').css('display', 'none');
		$('#home_userphoto_buttons').children('a').css('display', 'none');
	},
	
	profile : function(location){	
		window.location.href = '#profile';
		gotchapopup.waitingshow();
		$(document).ready(function() {
			if (location=='accountProfile') {
				gotchaUser.loadData({
					success : function(result) {
						$('#targetAvatar').attr('src', result.photo);
						$('#accountname').html(result.username);
						$('#profilevalueusername').html(result.username);
						$('#profilevaluefirstname').html(result.firstname);
						$('#profilevaluehaircolor').html(result.haircolor);
						$('#profilevalueeyescolor').html(result.eyescolor);
						$('#profilevalueheight').html(result.height);
						$('#profilevaluesigns1').html(result.signs1);
						$('#profilevaluesigns2').html(result.signs2);
						$('#profilevaluezone1').html(result.zone1);
						$('#profilevaluezone2').html(result.zone2);
						gotchapopup.waitinghide();
					}
				});
			}
			else {
				gotchaUserTarget.loadData({
					success : function(result) {
						$('#profilevalueusername').html(result.username);	
						$('#profilevaluefirstname').html(result.firstname);
						$('#profilevaluehaircolor').html(result.haircolor);
						$('#profilevalueeyescolor').html(result.eyescolor);
						$('#profilevalueheight').html(result.height);
						$('#profilevaluesigns1').html(result.signs1);
						$('#profilevaluesigns2').html(result.signs2);
						$('#profilevaluezone1').html(result.zone1);
						$('#profilevaluezone2').html(result.zone2);
						$('.profilevalue').attr('onclick','').unbind('click');
						$('#backToHome').attr('href','#target');
						gotchapopup.waitinghide();
					}
				},'targetProfile');
			}
		});
	},
	
	saveAvatar : function(avatar){
		gotchapopup.waitingshow();
		var avatarOwner = $('#accountname').text();
		var User = StackMob.Model.extend({
		    schemaName: 'user',
		    binaryFields: ['photo']
		});
		var user = new StackMob.User({username : avatarOwner});
		user.setBinaryFile('photo', avatarOwner, 'jpeg', avatar);
		user.save({}, {
		  success: function(model, result, options) {
			  gotchapopup.waitinghide();
		  },
		  error: function(model, result, options) {
			  gotchapopup.waitinghide();
			  alert('Can not update your photo');
		  }
		});	
	},
	
	profileUpdate : function(profileField) {
		var value = $('#profilevalue'+profileField).text();
		var nick = $('#profilevalueusername').text();
		var form = "<form id="+"profileForm"+" method="+"post"+" name="+"profileUpdate"+"><input id="+"profileInput"+" name="+profileField+" type="+"text"+"></form>";
		$('#profilevalue'+profileField).css('border', '1px solid white');
		$('#profilevalue'+profileField).html(form);
		$('#profilevalue'+profileField).attr('onclick', null);
		$("#profileInput").focus();
		$("#profileInput").blur(function(){
		    if($(this).val() != ''){
		    	gotchapopup.waitingshow();
		    	var newvalue = $(this).val();
		    	switch(profileField) {
				case "firstname" :
					var user = new StackMob.User({username : nick, firstname : newvalue});
					break;
				case "haircolor" :
					var user = new StackMob.User({username : nick, haircolor : newvalue});
					break;
				case "eyescolor" :
					var user = new StackMob.User({username : nick, eyescolor : newvalue});
					break;
				case "height" :
					var user = new StackMob.User({username : nick, height : newvalue});
					break;
				case "signs1" :
					var user = new StackMob.User({username : nick, signs1 : newvalue});
					break;
				case "signs2" :
					var user = new StackMob.User({username : nick, signs2 : newvalue});
					break;
				case "zone1" :
					var user = new StackMob.User({username : nick, zone1 : newvalue});
					break;
				case "zone2" :
					var user = new StackMob.User({username : nick, zone2 : newvalue});
					break;
				}
				user.save()
				$('#profilevalue'+profileField).html(newvalue);
				$('#profilevalue'+profileField).css('border', '1px solid black');
				$('#profilevalue'+profileField).attr('onclick', "gotchaHome.profileUpdate('"+profileField+"')");
				gotchapopup.waitinghide();				
		    }
		    else {
		    	$('#profilevalue'+profileField).html(value);
		    	$('#profilevalue'+profileField).css('border', '1px solid black');
				$('#profilevalue'+profileField).attr('onclick', "gotchaHome.profileUpdate('"+profileField+"')");
		    }
		});
	},
	
	newvalue : null,
	
	sessionUpdate : function(keyzoneField){
			var value = $('#homegamezone'+keyzoneField).text();
			var nick = $('#accountname').text();
			var form = "<form id="+"keyzoneForm"+" method="+"post"+" name="+"keyzoneUpdate"+"><input id="+"keyzoneInput"+" name="+keyzoneField+" type="+"text"+"></form>";
			$('#homegamezone'+keyzoneField).html(form);
			$('#homegamezone'+keyzoneField).attr('onclick', null);
			$("#keyzoneInput").focus();
			$("#keyzoneInput").blur(function(){
			    if($(this).val() != ''){
			    	gotchapopup.waitingshow();
			    	gotchaHome.newvalue = $(this).val();
			    	switch(keyzoneField) {
					case "key1" :
						var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
					  	var session = new sessionModel();
					  	var stackmobQuery = new StackMob.Collection.Query().equals('username', nick).notEquals('closed', true).setRange(0,0);
						session.query(stackmobQuery, {
						  success: function(collection) {
							  var resultSession = (collection.toJSON());
							  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
							  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
							  sessionClose.save(); 
							  var session = new sessionModel({
								  username : resultSession[0].username,
								  closed : false,
								  target : null,
								  gamingkey1 : gotchaHome.newvalue,
								  gamingkey2 : resultSession[0].gamingkey2,
								  gamingkey3 : resultSession[0].gamingkey3,
								  gamingkey4 : resultSession[0].gamingkey4,
								  gamingkey5 : resultSession[0].gamingkey5
							  });	
							  session.save();
							  $('#homegamezone'+keyzoneField).html("1 - "+gotchaHome.newvalue);
							  $('#homegamezone'+keyzoneField).attr('onclick', "gotchaHome.sessionUpdate('"+keyzoneField+"')");
							  $('a.linktarget').css('display','none');
							  if (gotchaHome.profiloCompleto==true) {$('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');}
							  gotchapopup.waitinghide();
							  gotchaHome.loadUserData();
						  }
						});
						break;
					case "key2" :
						var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
					  	var session = new sessionModel();
					  	var stackmobQuery = new StackMob.Collection.Query().equals('username', nick).notEquals('closed', true).setRange(0,0);
						session.query(stackmobQuery, {
						  success: function(collection) {
							  var resultSession = (collection.toJSON());
							  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
							  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
							  sessionClose.save(); 
							  var session = new sessionModel({
								  username : resultSession[0].username,
								  closed : false,
								  target : null,
								  gamingkey1 : resultSession[0].gamingkey1,
								  gamingkey2 : gotchaHome.newvalue,
								  gamingkey3 : resultSession[0].gamingkey3,
								  gamingkey4 : resultSession[0].gamingkey4,
								  gamingkey5 : resultSession[0].gamingkey5
							  });	
							  session.save();
							  $('#homegamezone'+keyzoneField).html("2 - "+gotchaHome.newvalue);
							  $('#homegamezone'+keyzoneField).attr('onclick', "gotchaHome.sessionUpdate('"+keyzoneField+"')");
							  $('a.linktarget').css('display','none');
							  $('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');
							  gotchapopup.waitinghide();
							  gotchaHome.loadUserData();
						  }
						});
						break;
					case "key3" :
						var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
					  	var session = new sessionModel();
					  	var stackmobQuery = new StackMob.Collection.Query().equals('username', nick).notEquals('closed', true).setRange(0,0);
						session.query(stackmobQuery, {
						  success: function(collection) {
							  var resultSession = (collection.toJSON());
							  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
							  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
							  sessionClose.save(); 
							  var session = new sessionModel({
								  username : resultSession[0].username,
								  closed : false,
								  target : null,
								  gamingkey1 : resultSession[0].gamingkey1,
								  gamingkey2 : resultSession[0].gamingkey2,
								  gamingkey3 : gotchaHome.newvalue,
								  gamingkey4 : resultSession[0].gamingkey4,
								  gamingkey5 : resultSession[0].gamingkey5
							  });	
							  session.save();
							  $('#homegamezone'+keyzoneField).html("3 - "+gotchaHome.newvalue);
							  $('#homegamezone'+keyzoneField).attr('onclick', "gotchaHome.sessionUpdate('"+keyzoneField+"')");
							  $('a.linktarget').css('display','none');
							  $('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');
							  gotchapopup.waitinghide();
							  gotchaHome.loadUserData();
						  }
						});
						break;
					case "key4" :
						var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
					  	var session = new sessionModel();
					  	var stackmobQuery = new StackMob.Collection.Query().equals('username', nick).notEquals('closed', true).setRange(0,0);
						session.query(stackmobQuery, {
						  success: function(collection) {
							  var resultSession = (collection.toJSON());
							  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
							  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
							  sessionClose.save(); 
							  var session = new sessionModel({
								  username : resultSession[0].username,
								  closed : false,
								  target : null,
								  gamingkey1 : resultSession[0].gamingkey1,
								  gamingkey2 : resultSession[0].gamingkey2,
								  gamingkey3 : resultSession[0].gamingkey3,
								  gamingkey4 : gotchaHome.newvalue,
								  gamingkey5 : resultSession[0].gamingkey5
							  });	
							  session.save();
							  $('#homegamezone'+keyzoneField).html("4 - "+gotchaHome.newvalue);
							  $('#homegamezone'+keyzoneField).attr('onclick', "gotchaHome.sessionUpdate('"+keyzoneField+"')");
							  $('a.linktarget').css('display','none');
							  $('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');
							  gotchapopup.waitinghide();
							  gotchaHome.loadUserData();
						  }
						});
						break;
					case "key5" :
						var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
					  	var session = new sessionModel();
					  	var stackmobQuery = new StackMob.Collection.Query().equals('username', nick).notEquals('closed', true).setRange(0,0);
						session.query(stackmobQuery, {
						  success: function(collection) {
							  var resultSession = (collection.toJSON());
							  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
							  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
							  sessionClose.save(); 
							  var session = new sessionModel({
								  username : resultSession[0].username,
								  closed : false,
								  target : null,
								  gamingkey1 : resultSession[0].gamingkey1,
								  gamingkey2 : resultSession[0].gamingkey2,
								  gamingkey3 : resultSession[0].gamingkey3,
								  gamingkey4 : resultSession[0].gamingkey4,
								  gamingkey5 : gotchaHome.newvalue
							  });	
							  session.save();
							  $('#homegamezone'+keyzoneField).html("5 - "+gotchaHome.newvalue);
							  $('#homegamezone'+keyzoneField).attr('onclick', "gotchaHome.sessionUpdate('"+keyzoneField+"')");
							  $('a.linktarget').css('display','none');
							  $('#homeGameReadyButton').html('Ok,here i am, give me a target and be sure, i will find him');
							  gotchapopup.waitinghide();
							  gotchaHome.loadUserData();
						  }
						});
						break;
					}
			    }
			    else {
			    	$('#homegamezone'+keyzoneField).html(value);
					$('#homegamezone'+keyzoneField).attr('onclick', "gotchaHome.profileUpdate('"+keyzoneField+"')");
			    }
			});
	},
	
	sessionToAddTarget : null,
	newTarget: null,
	oldTarget: null,
	
	selectTarget : function(){
		$(document).ready(function() {
			gotchapopup.waitingshow();
			var user = new StackMob.User();
			user.isLoggedIn({
				yes: function(username){
					var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
				  	var session = new sessionModel();
				  	var stackmobQuery = new StackMob.Collection.Query().equals('username', username).notEquals('closed', true).setRange(0,0);
					session.query(stackmobQuery, {
					  success: function(collection) {
						  var resultSession = (collection.toJSON());
						  if (resultSession[0].target==null){
							gotchaHome.sessionToAddTarget=resultSession[0].session_id;
							var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
							var session = new sessionModel();
							var q = new StackMob.Collection.Query().equals('username', resultSession[0].username).equals('closed', true).orderDesc('lastmoddate').setRange(0,0);
							session.query(q, {
								success: function(collection) {
									var resultoldTarget = (collection.toJSON());
									if (JSON.stringify(resultoldTarget) != '{}') {gotchaHome.oldTarget = resultoldTarget[0].target;}
									var stackmobQueryKey1 = new StackMob.Collection.Query().mustBeOneOf('gamingkey1', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
									var stackmobQueryKey2 = new StackMob.Collection.Query().mustBeOneOf('gamingkey2', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
									var stackmobQueryKey3 = new StackMob.Collection.Query().mustBeOneOf('gamingkey3', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
									var stackmobQueryKey4 = new StackMob.Collection.Query().mustBeOneOf('gamingkey4', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
									var stackmobQueryKey5 = new StackMob.Collection.Query().mustBeOneOf('gamingkey5', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
									var stackmobQueryUsername = new StackMob.Collection.Query().notEquals('username', resultSession[0].username);
									var stackmobQueryClosed = new StackMob.Collection.Query().notEquals('closed', true);
									var stackmobNotOldTarget = new StackMob.Collection.Query().notEquals('username', gotchaHome.oldTarget);
									var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
								  	var session = new sessionModel();
								  	session.query(stackmobQueryKey1.or(stackmobQueryKey2).or(stackmobQueryKey3).or(stackmobQueryKey4).or(stackmobQueryKey5).and(stackmobQueryClosed).and(stackmobQueryUsername).and(stackmobNotOldTarget).setRange(0,0), {
									  success: function(collection) {
										  var resultTarget = (collection.toJSON());
										  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
										  var session = new sessionModel({ session_id : gotchaHome.sessionToAddTarget, target : resultTarget[0].username });
										  session.save();
										  gotchaHome.targetAssegnato=true;
										  $('#homeGameReadyButton').html('I can not find my target, i lose this hard. Please give me another target');  
										  $('a.linktarget').css('display','block'); 
										  gotchaHome.loadUserData();
										  gotchapopup.waitinghide();
									  }
								  	});
								}
							});
						  }
						  else {
							gotchaHome.sessionToAddTarget=resultSession[0].session_id;							
							var stackmobQueryKey1 = new StackMob.Collection.Query().mustBeOneOf('gamingkey1', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
							var stackmobQueryKey2 = new StackMob.Collection.Query().mustBeOneOf('gamingkey2', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
							var stackmobQueryKey3 = new StackMob.Collection.Query().mustBeOneOf('gamingkey3', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
							var stackmobQueryKey4 = new StackMob.Collection.Query().mustBeOneOf('gamingkey4', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
							var stackmobQueryKey5 = new StackMob.Collection.Query().mustBeOneOf('gamingkey5', [resultSession[0].gamingkey1,resultSession[0].gamingkey2,resultSession[0].gamingkey3,resultSession[0].gamingkey4,resultSession[0].gamingkey5]);
							var stackmobQueryUsername = new StackMob.Collection.Query().notEquals('username', resultSession[0].username);
							var stackmobQueryClosed = new StackMob.Collection.Query().notEquals('closed', true);
							var stackmobQueryOldTargetAssigned = new StackMob.Collection.Query().notEquals('username', resultSession[0].target);
							var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
						  	var session = new sessionModel();
						  	session.query(stackmobQueryKey1.or(stackmobQueryKey2).or(stackmobQueryKey3).or(stackmobQueryKey4).or(stackmobQueryKey5).and(stackmobQueryClosed).and(stackmobQueryUsername).and(stackmobQueryOldTargetAssigned), {
							  success: function(collection) {
								  var resultTarget = (collection.toJSON());
								  gotchaHome.newTarget = resultTarget[0].username;
								  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
								  var session = new sessionModel();
								  var stackmobQuery = new StackMob.Collection.Query().equals('username', username).notEquals('closed', true).setRange(0,0);
								  session.query(stackmobQuery, {
									  success : function(collection) {
										  var resultSession = (collection.toJSON());
										  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
										  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
										  sessionClose.save(); 
										  var session = new sessionModel({
											  username : resultSession[0].username,
											  closed : false,
											  target : gotchaHome.newTarget,
											  gamingkey1 : resultSession[0].gamingkey1,
											  gamingkey2 : resultSession[0].gamingkey2,
											  gamingkey3 : resultSession[0].gamingkey3,
											  gamingkey4 : resultSession[0].gamingkey4,
											  gamingkey5 : resultSession[0].gamingkey5,
										  });	
										  session.save();
										  gotchaHome.targetAssegnato=true;
										  gotchapopup.waitinghide();
									  }
								  });
							  }
						  	});
						  }
					  }
					});
				},
				no: function(){
					console.log("Not logged in.");
				}
			});
		});
	}
}

var gotchaTarget = {
	
	targetUsername : null,
		
	loadUserData : function() {
		$(document).ready(function() {
			gotchapopup.waitingshow();
			if(gotchaHome.targetAssegnato==true){$('a.linktarget').css('display','inline');}
			gotchaUserTarget.loadData({
				success : function(result) {
					$('#accountname').html(result.username);
					gotchaTarget.targetUsername = result.username;
					$('#targetAvatar').attr('src', result.photo);
					$('#targetAccounreward').html(result.reward);
					$('#profilevalueusername').html(result.username);
					$('#profilevaluefirstname').html(result.firstname);
					$('#profilevaluehaircolor').html(result.haircolor);
					$('#profilevalueeyescolor').html(result.eyescolor);
					$('#profilevalueheight').html(result.height);
					$('#profilevaluesigns').html(result.signs1);
					$('#profilevaluesigns').append('<br/>'+result.signs2);
					$('#profilevaluezone').html(result.zone1);
					$('#profilevaluezone').append('<br/>'+result.zone2);
					gotchapopup.waitinghide();
				}
			},'targetProfile');	// Target profile è un tag che serve per caricare le info del target invece che della sessione				
		});
	},
	
	checkCoords : function() {
		gotchapopup.waitingshow();
		var user = new StackMob.User();
		user.isLoggedIn({
			yes: function(username){
				var stackmobQuery = new StackMob.Collection.Query().equals('username', username);
				user.query(stackmobQuery, {
					  success: function(collection) {
						  var result = (collection.toJSON());
						  var lat = result[0].location.lat;
						  var lon = result[0].location.lon;
						  var latlon = new StackMob.GeoPoint(lat,lon);
						  var obiettivo = new StackMob.Collection.Query().equals('username', gotchaTarget.targetUsername);
						  var distanza = new StackMob.Collection.Query().mustBeNearKm('location', latlon, 0.1);
						  user.query(obiettivo.and(distanza), {
							  success: function(collection) {
								  var obiettivoTrovato = (collection.toJSON());
							      if (obiettivoTrovato[0].username==result[0].username){
							    	  gotchascripts.updateLose(username);
							    	  alert('So Bad, u killed wrong one!!! RUN, NOW');
							      }
							      else if (obiettivoTrovato[0].username==gotchaTarget.targetUsername){
							    	  gotchascripts.updateWin(username,gotchaTarget.targetUsername);
							    	  alert('Oh Man! you are a killer! you catch him, Congrats.....RUN NOW');
							    	  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
									  var session = new sessionModel();
									  var stackmobQuery = new StackMob.Collection.Query().equals('username', username).notEquals('closed', true).setRange(0,0);
									  session.query(stackmobQuery, {
										  success: function(collection) {
											  var resultSession = (collection.toJSON());
									    	  var sessionModel = StackMob.Model.extend({ schemaName: 'session' });
									    	  var sessionClose = new sessionModel({ session_id : resultSession[0].session_id, closed : true });
									    	  sessionClose.save(); 
											  var session = new sessionModel({
												  username : resultSession[0].username,
												  closed : false,
												  target : null,
												  gamingkey1 : resultSession[0].gamingkey1,
												  gamingkey2 : resultSession[0].gamingkey2,
												  gamingkey3 : resultSession[0].gamingkey3,
												  gamingkey4 : resultSession[0].gamingkey4,
												  gamingkey5 : resultSession[0].gamingkey5
											  });	
											  session.save();
									      }
									  });
							      }
							      else {
							    	  gotchascripts.updateLose(username);
							    	  alert('Oh God! you can not kill the first you see, what u have done! RUN, NOW');
							      }
							      gotchapopup.waitinghide();
							      gotchaHome.targetAssegnato=false;
							      window.location.href = '#home';
							  }
						  });
					  }
				});
			},
			no:function(){	
				console.log("Not logged in.");
			}	  	
		});
	}
}


var gotchaAccountStats = {
	myScore: null,
	myUsername:null,
	secondUsername:null,
	loadData : function(){
		$(document).ready(function() {
			gotchapopup.waitingshow();
			if(gotchaHome.targetAssegnato==true){$('a.linktarget').css('display','inline');}
			var user = new StackMob.User();
			user.isLoggedIn({
				yes: function(username){
					var stackmobQuery = new StackMob.Collection.Query().equals('username', username);
					user.query(stackmobQuery, {
						  success: function(collection) {
							  var result = (collection.toJSON());
							  $('#count_score').html(result[0].score);
							  $('#count_reward').html(result[0].reward);
							  $('#count_gotcha').html(result[0].gotcha);
							  $('#count_target').html(result[0].targetscore);
							  $('#accountstatsrankme').html(result[0].score+" - <b>"+result[0].username+"</b>");
							  gotchaAccountStats.myScore=result[0].score;
							  gotchaAccountStats.myUsername=result[0].username;
							  var stackmobQuery = new StackMob.Collection.Query().lt('score',result[0].score).orderDesc('score').setRange(0,0);
							  user.query(stackmobQuery, {
								  success: function(collection) {
									  var resultAfter = (collection.toJSON());
									  $('#accountstatsrankafterme').html(resultAfter[0].score+" - <b>"+resultAfter[0].username+"</b>");
									  gotchaAccountStats.secondUsername=resultAfter[0].username;
									  if (resultAfter[0].username==gotchaAccountStats.myUsername){$('#accountstatsrankafterme').html('...');}
									  var stackmobQuery = new StackMob.Collection.Query().gt('score',gotchaAccountStats.myScore).orderAsc('score').setRange(0,0);
									  user.query(stackmobQuery, {
										  success: function(collection) {
											  var resultBefore = (collection.toJSON());
											  $('#accountstatsrankbeforeme').html(resultBefore[0].score+" - <b>"+resultBefore[0].username+"</b>");
											  if (resultBefore[0].username==gotchaAccountStats.secondUsername){$('#accountstatsrankbeforeme').html('...');}
											  gotchapopup.waitinghide();
										  }
									  });
								  }
							  });
						  }
					});	
				},
				no:function(){	
					console.log("Not logged in.");
				}	  	
			});
		});
	}
}

var gotchaGlobalStats = {
		loadData : function(){
			$(document).ready(function() {
				gotchapopup.waitingshow();
				var user = new StackMob.User();
				user.isLoggedIn({
					yes: function(username){
						var stackmobQuery = new StackMob.Collection.Query().orderDesc('score').setRange(0,2);
						user.query(stackmobQuery, {
							  success: function(collection) {
								  var resultScore = (collection.toJSON()); 
								  $('#globalstatsbestrank').html(resultScore[0].score+" - <b>"+resultScore[0].username+"</b>");
								  $('#globalstatssecondrank').html(resultScore[1].score+" - <b>"+resultScore[1].username+"</b>");
								  $('#globalstatstirthrank').html(resultScore[2].score+" - <b>"+resultScore[2].username+"</b>");
								  $('#count_score.name').html(resultScore[0].username);
								  $('#count_score.item').html(resultScore[0].score);
								  var stackmobQuery = new StackMob.Collection.Query().orderDesc('reward').setRange(0,0);
								  user.query(stackmobQuery, {
									  success: function(collection) {
										  var resultReward = (collection.toJSON()); 
										  $('#count_reward.name').html(resultReward[0].username);
										  $('#count_reward.item').html(resultReward[0].reward);
										  var stackmobQuery = new StackMob.Collection.Query().orderDesc('gotcha').setRange(0,0);
										  user.query(stackmobQuery, {
											  success: function(collection) {
												  var resultGotcha = (collection.toJSON()); 
												  $('#count_gotcha.name').html(resultGotcha[0].username);
												  $('#count_gotcha.item').html(resultGotcha[0].gotcha);
												  var stackmobQuery = new StackMob.Collection.Query().orderDesc('targetscore').setRange(0,0);
												  user.query(stackmobQuery, {
													  success: function(collection) {
														  var resultTargetScore = (collection.toJSON()); 
														  $('#count_target.name').html(resultTargetScore[0].username);		  
														  $('#count_target.item').html(resultTargetScore[0].targetscore);
														  gotchapopup.waitinghide();
													  }
												  });
											  }
										  });
									  }
								  });
							  }
						});	
					},
					no:function(){	
						console.log("Not logged in.");
					}	  	
				});
			});
		}
	}



var gotchascripts = {				

		getCoords : function(){
			navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
		},
		
		onSuccess : function(position) {
			var lat= position.coords.latitude;
			var lon= position.coords.longitude;
			var user = new StackMob.User();
			user.isLoggedIn({
				yes: function(username){
					var latlon = new StackMob.GeoPoint(lat,lon);
					var user = new StackMob.User({ username: username, location: latlon.toJSON() });
					user.save({
					  success: function(model, response, options) {},
					  error: function(model, response, options) {}
					});
				},
				no:function(){	
					console.log("Not logged in.");
				}	  	
			});
	    },
	    
	    onError : function(error) {
	        alert('code: '    + error.code    + '\n' +
	              'message: ' + error.message + '\n');
	    },

		
		
		sleep : function(milliseconds) {
		  var start = new Date().getTime();
		  for (var i = 0; i < 1e7; i++) {
		    if ((new Date().getTime() - start) > milliseconds){
		      break;
		    }
		  }
		},
		
		resultUser : null,
		
		resultTarget : null,		
		
		updateWin : function(username,target) {
			var user = new StackMob.User({ username: username });
			user.fetch({
		      success: function(collection) {
		    	  gotchascripts.resultUser = collection.toJSON();
		          var user = new StackMob.User({ username: target });
		          user.fetch({
		        	  success: function(collection) {
		        		  gotchascripts.resultTarget = collection.toJSON();
				          var resultUserGotcha = gotchascripts.resultUser.gotcha+1;
				          var resultUserReward = gotchascripts.resultUser.reward+100;
				          var resultUserScore = gotchascripts.resultUser.score+gotchascripts.resultTarget.reward;
				          var resultTargetTargetScore = gotchascripts.resultTarget.targetscore+70;
				          var user = new StackMob.User({ username : gotchascripts.resultUser.username, gotcha : resultUserGotcha, reward : resultUserReward, score : resultUserScore  });
				          user.save();
				          var user = new StackMob.User({ username : gotchascripts.resultTarget.username, targetscore : resultTargetTargetScore  });
				          user.save();
		        	  }
		          });
		      }
			});
		},
		
		updateLose : function(username){
			var user = new StackMob.User({ username: username });
			user.fetch({
		      success: function(collection) {
        		  var result = collection.toJSON();
		          var resultUserReward = result.reward-200;
		          var resultUserScore = result.score-500;
		          var user = new StackMob.User({ username : gotchascripts.resultUser.username, reward : resultUserReward, score : resultUserScore  });
		          user.save();
		      }
			});
		}


}

	




