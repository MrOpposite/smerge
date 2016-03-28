notifications = new Meteor.Stream('server-notifications');

Session.setDefault("showLogin", true);
Session.setDefault("loginFailed", false);
Session.setDefault("registerFailed", false);
Session.setDefault("facebookExpires", null);
Session.setDefault("twitterConnected", false);

Tracker.autorun(function () {
	
	Meteor.call("facebookCheck", function (error,result) {
		if(!error)
			Session.set("facebookExpires",result);
	});
	
	Meteor.call("twitterCheck", function (error,result) {
		if(!error)
			Session.set("twitterConnected",result);
	});
});

Accounts.onLogin(function(){
	Meteor.call("facebookCheck", function (error,result) {
		if(!error)
			Session.set("facebookExpires",result);
	});
	
	Meteor.call("twitterCheck", function (error,result) {
		if(!error) {
			Session.set("twitterConnected",result);
			
			notifications.on('tweets-'+Accounts.userId(), function(message, time) {
			var completeMessage = message;
			console.log(completeMessage);
		});
		}
	});
});

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL',
});

Template.userMenu.events({
	"click #signOutButton": function(event){
		event.preventDefault();
		Meteor.logout();
	},
	"click #connectFacebookButton": function(event){
		event.preventDefault();
		Meteor.linkWithFacebook();
	},
	"click #disconnectFacebookButton": function(event){
		event.preventDefault();
		Meteor.call("disconnectFacebook", function(error,response){if(!error)Session.set("facebookExpires",null)});
	},
	"click #connectTwitterButton": function(event){
		event.preventDefault();
		Meteor.linkWithTwitter();
	},
	"click #disconnectTwitterButton": function(event){
		event.preventDefault();
		//Meteor.call("disconnectTwitter", function(error,response){if(!error)Session.set("twitterConnected",false)});
		Meteor.call("fetchTweets");
	},
});

Template.feed.helpers({
	tweets: function() {
		console.log(Accounts.user());
		return (Accounts.user()&&Accounts.user().twitterFeed)?Accounts.user().twitterFeed:[];
	}
})

Template.userMenu.helpers({
	facebook: function(){
		return new Date() < new Date(Session.get("facebookExpires"));
	},
	twitter: function(){
		return Session.get("twitterConnected");
	}
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
});

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