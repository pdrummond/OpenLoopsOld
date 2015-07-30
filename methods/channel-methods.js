Meteor.methods({
  createChannel: function (channel) {
    channel.timestamp = Date.now();
    channel.user = Meteor.userId();
    Channels.insert(channel);

    var result = Meteor.call('newMessage', {	
    	template:'welcomeMessage',
    	channel: channel.name,
    	timestamp: Date.now(),
    	user: Meteor.userId()
    });
  }
})