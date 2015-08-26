Meteor.methods({
  createActivity: function (activity) {
  	activity.type = 'activity';
    activity.timestamp = activity.timestamp || Date.now();
    activity.userId = Meteor.userId();
    switch(activity.activityType) {
    	case 'create-action': activity.activityTemplate = 'createActionActivity'; break;
    	case 'create-milestone': activity.activityTemplate = 'createMilestoneActivity'; break;
      case 'create-comment': activity.activityTemplate = 'createCommentActivity'; break;
      case 'task-status-change': activity.activityTemplate = 'taskStatusChangeActivity'; break;
      case 'task-milestone-change': activity.activityTemplate = 'taskMilestoneChangeActivity'; break;
    }
    var activityId = Messages.insert(activity);
  },
});