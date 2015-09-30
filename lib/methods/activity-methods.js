Meteor.methods({
  createActivity: function (activity) {
  	activity.type = 'activity';
    activity.timestamp = activity.timestamp || Date.now();
    activity.userId = Meteor.userId();
    switch(activity.activityType) {
    	case 'create-item': activity.activityTemplate = 'createItemActivity'; break;
      case 'create-post': activity.activityTemplate = 'createPostActivity'; break;
      case 'item-attr-change': activity.activityTemplate = 'itemAttrChangeActivity'; break;      
      case 'item-archived-change': activity.activityTemplate = 'itemArchivedChangeActivity'; break;
      case 'item-moved-from-board-activity': activity.activityTemplate = 'itemMovedFromBoardActivity'; break;
      case 'item-moved-to-board-activity': activity.activityTemplate = 'itemMovedToBoardActivity'; break;
    }
    var activityId = Messages.insert(activity);
  },
});