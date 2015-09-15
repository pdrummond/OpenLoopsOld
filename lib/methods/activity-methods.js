Meteor.methods({
  createActivity: function (activity) {
  	activity.type = 'activity';
    activity.timestamp = activity.timestamp || Date.now();
    activity.userId = Meteor.userId();
    switch(activity.activityType) {
    	case 'create-item': activity.activityTemplate = 'createItemActivity'; break;
      case 'create-post': activity.activityTemplate = 'createPostActivity'; break;
    	case 'create-milestone': activity.activityTemplate = 'createMilestoneActivity'; break;
      case 'create-comment': activity.activityTemplate = 'createCommentActivity'; break;
      case 'action-attr-change': activity.activityTemplate = 'actionAttrChangeActivity'; break;
      case 'action-milestone-change': activity.activityTemplate = 'actionMilestoneChangeActivity'; break;
      case 'action-archived-change': activity.activityTemplate = 'actionArchivedChangeActivity'; break;
    }
    var activityId = Messages.insert(activity);
  },
});