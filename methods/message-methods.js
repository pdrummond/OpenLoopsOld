Meteor.methods({
  newMessage: function (message) {
    message.timestamp = Date.now();
    message.userId = Meteor.userId();
    return Messages.insert(message);
  }
})