Meteor.methods({
  newMessage: function (message) {
    message.timestamp = Date.now();
    message.userId = Meteor.userId();

    if(message.type == 'task') {
      message.status = 'new';
    }

    var messageId = Messages.insert(message);

    //If message is a milestone then create a specific milestone
    //entity so it's easy to get all milestones at once rather than
    //always search messages for type:milestone which doesn't work 
    //when the messages are loaded page-by-page.
    if(message.type === 'milestone') {
    	Milestones.insert({
    		text: message.text,
    		channel: message.channel,
    		userId: message.userId,
    		messageId: messageId
    	});    	
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