  Meteor.startup(function () {
    // code to run on server at startup
		
  });
	Meteor.publish("twitterFeed", function(){
		return Accounts.users.find({_id: this.userId},{fields: {'twitterFeed': 1}});
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
		fetchTweets: function() {
			if(Meteor.call("twitterCheck")) {
				var Twit = new TwitMaker({
						consumer_key:         '***REMOVED***'
					, consumer_secret:      '***REMOVED***'
					, access_token:         '***REMOVED***'
					, access_token_secret:  '***REMOVED***'
				});
				var get = Meteor.wrapAsync(Twit.get.bind(Twit));
				get('statuses/home_timeline',function(err, data, response){
					if(!err) {
						Accounts.users.update(Accounts.userId(),{$set: {twitterFeed: data}});
					}
				});
			}
		}
	})
	Accounts.onLogin(function(){
	});