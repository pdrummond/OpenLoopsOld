Meteor.methods({
  createChannel: function (channel) {
    channel.timestamp = Date.now();
    channel.userId = Meteor.userId();
    Channels.insert(channel);

    var result = Meteor.call('newMessage', {	
    	template:'welcomeMessage',
    	channel: channel.name,
    	timestamp: Date.now(),
    	userId: Meteor.userId()
    });
  }
})