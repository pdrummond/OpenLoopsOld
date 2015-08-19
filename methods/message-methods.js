Meteor.methods({
  createMessage: function (message) {
    message.timestamp = Date.now();
    message.userId = Meteor.userId();

    if(message.type == 'task') {
      message.status = 'new';
      message.description = " "; //needed for markdown processing.
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

  updateMessageStatus:function(messageId, newStatus, channel) {    
    var message = Messages.findOne(messageId);
    var oldStatus = message.status;
    Messages.update(messageId, {$set: {status: newStatus}});
    var message = Messages.findOne(messageId);
    
    Meteor.call('createActivity', {
      action: 'task-status-change',        
      task: message,
      taskOldStatus: oldStatus,
      taskNewStatus: newStatus,
      boardId: message.boardId,
      activityChannel: channel,
    });
  },

  updateMessageMilestoneId:function(messageId, milestoneId, channel) {
    var task = Messages.findOne(messageId);
    var oldMilestone;
    var oldMilestoneTitle;
    if(task.milestone) {
      oldMilestone = Milestones.findOne(task.milestone);
      oldMilestoneTitle = oldMilestone.title;
    }
    Messages.update(messageId, {$set: {milestone: milestoneId}});
    var newMilestone = Milestones.findOne(milestoneId);
    var newMilestoneTitle = newMilestone.title;

    Meteor.call('createActivity', {
      action: 'task-milestone-change',
      task: task,
      taskOldMilestoneTitle: oldMilestoneTitle,
      taskNewMilestoneTitle: newMilestoneTitle,
      boardId: task.boardId,
      activityChannel: channel,
    });
  }
})