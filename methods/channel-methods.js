Meteor.methods({
  createChannel: function (channel) {
    channel.timestamp = Date.now();
    channel.userId = Meteor.userId();
    Channels.insert(channel);    
  }
})