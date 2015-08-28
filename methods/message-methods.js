Meteor.methods({

  createHabotMessage: function(message) {
    message.type = 'message';
    message.timestamp = Date.now();
    message.userId = 'habot';
    var messageId = Messages.insert(message);
    return messageId;

  },

  createMessage: function (message) {
    check(message, {
      type: String,
      text: String,
      boardId: String,
      channel: String,
    });
    message.timestamp = Date.now();
    message.userId = Meteor.userId();

    var messageId = Messages.insert(message);

    console.log("message.text: " + JSON.stringify(message.text, null, 4));
    if(message.text.indexOf('@habot') == 0) {
      var m = message.text.split(' ');
      if(m.length > 1 && m[1] == "hi") {
        Meteor.call('createHabotMessage', {text:"Hi there " + Meteor.user().username + ", how's it going?"});
      }
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
  }
})