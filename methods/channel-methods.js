Meteor.methods({
	createChannel: function (channel) {
		channel.timestamp = Date.now();
		channel.userId = Meteor.userId();
		channel.name = slugify(channel.name);
		return Channels.insert(channel);    
	},

	updateChannelDescription: function(name, newDescription) {
		Channels.update({name: name}, {$set: {description: newDescription}});

		var channel = Channels.findOne({name: name});

		if(channel.type = 'action-channel') {			
			Meteor.call('updateActionDescription', channel.action._id, newDescription);
		}
	},
})