loadFeedListCore = function() {
  FeedList = function() {
    this.feedTimes   = new Object();
    this.feedEntries = new Object();
    this.feedCache   = [];
    this.cacheValid  = false;
  }

  _loadFeedEntry();

  FeedList.prototype.hasExtId = function (extId) {
    if(!extId)
      throw new Meteor.Error("null-id", "External ID must be provided");

    var extIds = Object.getOwnPropertyNames(this.feedEntries);
    if(extIds.indexOf(extId) > -1) {
      return true;
    }
    return false;
  }

  FeedList.prototype._insert = function (entry) {

    if(!entry||!entry.extId||!entry.postedTime)
      throw new Meteor.Error("null-entry", "A valid feedEntry must be provided");

    if(this.hasExtId(entry.extId)) {
      throw new Meteor.Error("entry-exists", "This entry already exists");
    }

    if(!this.feedTimes[entry.postedTime.getTime()])
      this.feedTimes[entry.postedTime.getTime()] = [];

    this.cacheValid  = false;
    this.feedTimes[entry.postedTime.getTime()].push(entry.extId);
    this.feedEntries[entry.extId] = entry;
  }

  FeedList.prototype._remove = function (extId) {
    var self = this;

    if(!extId)
      throw new Meteor.Error("null-id", "External ID must be provided");

    Object.getOwnPropertyNames(this.feedTimes).forEach(function(times) {
      var oldTime = self.feedTimes[times];
      if(oldTime.indexOf(extId) > -1) {
        self.feedTimes[times] = [];
        oldTime.forEach(function(id) {
          if(id != extId)
            self.feedTimes[times].push(id);
        });
      }
    });

    this.cacheValid  = false;
    return delete this.feedEntries[extId];
  }

  FeedList.prototype._generateCache = function() {
    var self = this;

    this.feedCache = [];
    Object.getOwnPropertyNames(this.feedTimes).sort().forEach(function(times) {
      times = self.feedTimes[times];
      times.forEach(function(id) {
        self.feedCache.push(self.getEntry(id));
      });
    });
  }

  FeedList.prototype._updateCache = function(force) {
    if(!this.cacheValid||force) {
      this._generateCache();
      this.cacheValid = true;
      return true;
    }
    return false;
  }

  FeedList.prototype.getFeed = function() {
    this._updateCache();
    return this.feedCache;
  }

  FeedList.prototype.getEntry = function(extId) {
    return this.feedEntries[extId]||null;
  }
}
