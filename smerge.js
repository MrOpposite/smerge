if (Meteor.isClient) {
	Session.setDefault("showLogin", true);
	Session.setDefault("loginFailed", false);
	Session.setDefault("registerFailed", false);
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL',
	});
	
	Template.customLogin.helpers({
		userLoggedIn: function(){return Meteor.userId();},
	});
	
	Template.userMenu.events({
		"click #signOutButton": function(event){event.preventDefault();Meteor.logout();},
	});
	
	Template.registerOrLogin.helpers({
		showLogin: function(){return Session.get("showLogin");},
	});
	
	Template.registerOrLogin.events({
		"click #loginTab": function(event) {event.preventDefault();Session.set("registerFailed", false);Session.set("showLogin", true);},
		"click #registerTab": function(event) {event.preventDefault();Session.set("loginFailed", false);Session.set("showLogin", false);},
	})
	
	Template.login.events({
		"submit form": function(event) {
			event.preventDefault();
			var usernameOrEmail = event.target.loginUsernameOrEmail.value;
			var password = event.target.loginPassword.value;
			Meteor.loginWithPassword(usernameOrEmail,password,function(err) {
				if(err)
					Session.set("loginFailed",err.reason);
				else
					Session.set("loginFailed", null);
			});
		}
	});
	
	Template.login.helpers({
		failed: function(){return Session.get("loginFailed");}
	})
	
	Template.register.events({
		"submit form": function(event) {
			event.preventDefault();
			var userObj = {
				username: event.target.registerUsername.value,
				email:    event.target.registerEmail.value,
				password: event.target.registerPassword.value
			}
			if(!userObj.username) {
				Session.set("registerFailed","You need to enter a username!");
				return;
			}
			if(!userObj.email) {
				Session.set("registerFailed","You need to enter an email!");
				return;
			}
			Accounts.createUser(userObj,function(err) {
				console.log(err);
				if(err)
					Session.set("registerFailed",err.reason?err.reason:"Unknown error");
				else
					Session.set("registerFailed", null);
			});
		}
	});
	
	Template.register.helpers({
		failed: function(){return Session.get("registerFailed");}
	})
	
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
	
	
}
