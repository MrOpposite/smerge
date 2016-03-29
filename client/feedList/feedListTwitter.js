loadFeedTwitter = function() {

  var generateUser = function(twitterUser) {
    var user = {};
      user.name = twitterUser.name;
    return user;
  }

  var generateExtra = function(tweet) {
    var extra = {};

    return extra;
  }

  FeedList.prototype.hasTwitterId = function (twitterId) {
    if(!twitterId)
      throw new Meteor.Error("null-id", "Twitter ID must be provided");

    return this.hasExtId("twitter-"+twitterId);
  }

  FeedList.prototype.insertTweet = function (tweet) {
    if(!tweet)
      throw new Meteor.Error("null-tweet", "Tweet must be provided");
    var entry = new FeedEntry("tweet-"+tweet.id_str,
                              tweet.text,
                              tweet.user.profile_image_url_https,
                              generateUser(tweet.user),
                              new Date(Date.parse(tweet.created_at)),
                              generateExtra(tweet)
                              )
    this._insert(entry);
  }
}
