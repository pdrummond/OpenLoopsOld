Meteor.methods({
  createActivity: function (activity) {
  	activity.type = 'activity';
    activity.timestamp = activity.timestamp || Date.now();
    activity.userId = Meteor.userId();
    switch(activity.action) {
    	case 'create-task': activity.activityTemplate = 'createTaskActivity'; break;
    	case 'create-milestone': activity.activityTemplate = 'createMilestoneActivity'; break;
    }
    var activityId = Messages.insert(activity);
  },
});