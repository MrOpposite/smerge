Stream = new Meteor.Stream('feed');

if(Meteor.isClient) {
  var _feedList;
  Tracker.autorun(function () {
    loadFeedListCore();
    loadFeedTwitter();
    _feedList = new FeedList();
  });

  start = function() {
    //assume user is logged-in
		Stream.on('tweets-'+Meteor.userId(), function(message) {
      if(Array.isArray(message)) {
				message.forEach(function(tweet) {
          try {
            _feedList.insertTweet(tweet);
          } catch(e) {}
				});
			} else {
        try {
          _feedList.insertTweet(message);
        } catch(e) {}
			}
			Session.set('feedList', _feedList.getFeed());
    });
    Meteor.call('stream-tweets');

  };
}

if(Meteor.isServer) {
	var TwitAppKeys = ServiceConfiguration.configurations.findOne(
		{service: 'twitter'},
		{fields: {consumerKey: 1, secret: 1, _id: 0}});

	var userConnectionObjects = new Object();

	var checkUserConnectionObject = function(user) {
		if(!userConnectionObjects[user]) {
			userConnectionObjects[user] = new Object();
		}
	}

	var getUserTwitterObject = function () {
		checkUserConnectionObject(Meteor.userId());

		var twit = userConnectionObjects[Meteor.userId()].twitter;

		if(!twit) {
			var twitUserKeys = Meteor.user().services.twitter;

			twit = new TwitMaker({
					consumer_key:         TwitAppKeys.consumerKey
				, consumer_secret:      TwitAppKeys.secret
				, access_token:         twitUserKeys.accessToken
				, access_token_secret:  twitUserKeys.accessTokenSecret
			});

			userConnectionObjects[Meteor.userId()].twitter = twit;
		}

		return twit;
	}

	var getUserTwitterStreamObject = function (endpoint) {
		if(!endpoint) endpoint = 'user';

		checkUserConnectionObject(Meteor.userId());

		if(!userConnectionObjects[Meteor.userId()].twitterStream) {
			userConnectionObjects[Meteor.userId()].twitterStream = new Object();
		}

		var tStream = userConnectionObjects[Meteor.userId()]
			.twitterStream[endpoint];

		if(!tStream) {
			var twit = getUserTwitterObject();
			var tStream = twit.stream(endpoint);
			userConnectionObjects[Meteor.userId()].twitterStream[endpoint] = tStream;
		}

		return tStream;
	}

	/* Filter to make sure that users may only
	 * subscribe to their own twitter streams
	 */
  Stream.permissions.read(function(eventName) {
    return "tweets-"+this.userId == eventName;
  });

	Meteor.methods({

		/* Start a stream of tweets to a user.
		 * The user should listen for events on tweets-<userId>
		 */
		'stream-tweets': function() {
			var self = this; // Define self for use in callbacks

			// Get twitter-api-library object (user specific) or generate a new one
			var twit = getUserTwitterObject();


			var get = Meteor.wrapAsync(twit.get, twit);  // The twitter API does not use Meteor fibers, so using the async get method will
			                                             // break out of the Meteor fibers. Meteor.wrapAsync adds an abstracting callback to my
			                                             // own callback returning everything to the Meteor fibers context again.

			get('statuses/home_timeline',function(err, data, response){ // Get the latest tweets
				if(!err) {                                                // Silently ignore any errors | TODO: fix proper error handling
					Stream.emit('tweets-'+self.userId, data, Date.now());   // Emit the tweets to the stream
				}
			});

			var tStream = getUserTwitterStreamObject('user'); // Get a twitter stream object or generate a new one


			var asyncStreamer = Meteor.wrapAsync(tStream.on, tStream); // The twitter API does not use Meteor fibers, so using the async get method will
			                                                           // break out of the Meteor fibers. Meteor.wrapAsync adds an abstracting callback to my
			                                                           // own callback returning everything to the Meteor fibers context again.


			asyncStreamer('tweet',function(result) {
				Stream.emit('tweets-'+self.userId, result, Date.now()); // Start streaming tweets to the user.
			});
		}
	});
}
