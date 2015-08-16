Meteor.methods({
  createChannel: function (channel) {
    channel.timestamp = Date.now();
    channel.userId = Meteor.userId();
    channel.name = slugify(channel.name);
    Channels.insert(channel);    
  }
})