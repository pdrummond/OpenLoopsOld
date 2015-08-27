Meteor.methods({
  createActivity: function (activity) {
  	activity.type = 'activity';
    activity.timestamp = activity.timestamp || Date.now();
    activity.userId = Meteor.userId();
    switch(activity.activityType) {
    	case 'create-action': activity.activityTemplate = 'createActionActivity'; break;
    	case 'create-milestone': activity.activityTemplate = 'createMilestoneActivity'; break;
      case 'create-comment': activity.activityTemplate = 'createCommentActivity'; break;
      case 'action-status-change': activity.activityTemplate = 'actionStatusChangeActivity'; break;
      case 'action-milestone-change': activity.activityTemplate = 'actionMilestoneChangeActivity'; break;
    }
    var activityId = Messages.insert(activity);
  },
});