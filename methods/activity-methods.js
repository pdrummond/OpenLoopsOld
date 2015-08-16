Meteor.methods({
  createActivity: function (activity) {
  	activity.type = 'activity';
    activity.timestamp = Date.now();
    activity.userId = Meteor.userId();
    var activityId = Messages.insert(activity);
  },
});