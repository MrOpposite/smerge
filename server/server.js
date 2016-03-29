Meteor.startup(function () {
	// code to run on server at startup
	
});

Meteor.methods({
	facebookCheck: function() {
		var user = Meteor.user();
		if(user){
			if(user.services.facebook){
				var fb = user.services.facebook;
				return new Date(fb.expiresAt);
			}
		}
		return null;
	},
	disconnectFacebook: function() {
		Accounts.unlinkService(Meteor.userId(),"facebook");
	},
	twitterCheck: function() {
		var user = Meteor.user();
		if(user){
			if(user.services.twitter){
				return true;
			}
		}
		return false;
	},
	disconnectTwitter: function() {
		Accounts.unlinkService(Meteor.userId(),"twitter");
		Twit = null;
	},
})
Accounts.onLogin(function(){
});
