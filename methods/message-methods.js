Meteor.methods({
  createMessage: function (message) {
    message.timestamp = Date.now();
    message.userId = Meteor.userId();

    if(message.type == 'task') {
      message.status = 'new';
    }

    var messageId = Messages.insert(message);

    if(message.type == 'task') {
      var activityMessage = 'Created a task <strong>#OLZ-10</strong>';
      Meteor.call('createActivity', {text: activityMessage});
    }

    return messageId;
  },

  updateMessageText:function(messageId, newText) {
  	Messages.update(messageId, {$set: {text: newText}});
  	var message = Messages.findOne(messageId);
  	if(message.type == "milestone") {
  		var milestone = Milestones.findOne({messageId: message._id});
  		Milestones.update(milestone._id, {$set: {text: newText}});
  	}
  },

  updateMessageStatus:function(messageId, newStatus) {
  	Messages.update(messageId, {$set: {status: newStatus}});
  },

  updateMessageMilestone:function(messageId, milestoneId) {
  	Messages.update(messageId, {$set: {milestone: milestoneId}});
  }
})