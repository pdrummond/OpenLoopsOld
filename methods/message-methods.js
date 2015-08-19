Meteor.methods({
  createMessage: function (message) {
    message.timestamp = Date.now();
    message.userId = Meteor.userId();

    if(message.type == 'task') {
      message.status = 'new';
      message.uid = Meteor.isServer?incrementCounter(Counters, message.boardId):0;
    }

    var messageId = Messages.insert(message);

    if(message.type == 'task') {      
      Meteor.call('createActivity', {
        action: 'create-task',        
        task: Messages.findOne(messageId),
        boardId: message.boardId,        
        timestamp: message.timestamp -1 //To ensure activity appears in message history before task
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

  updateMessageMilestoneId:function(messageId, milestoneId) {
  	Messages.update(messageId, {$set: {milestone: milestoneId}});
  }
})