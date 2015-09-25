
Meteor.methods({

	createMessage: function (message) {
		check(message, {
			type: String,
			text: String,
			subjectItemId: Match.Optional(String),
			boardId: String
		});
		message.itemType = "message";
		message.timestamp = Date.now();
		message.userId = Meteor.userId();		

		var messageId = Messages.insert(message);

		var re = /@([\w\.-]+)/g;		
		var matches;

		do {
			matches = re.exec(message.text);
			if (matches) {
				var toUser = Meteor.users.findOne({username: matches[1]});
				if(toUser != null) {
					Meteor.call('createNotification', {
						type: 'new-message-mention',
						fromUserId: Meteor.userId(),
						toUserId: toUser._id,
						messageId: messageId
					});
				}
			}
		} while (matches);

		return messageId;
	},

});