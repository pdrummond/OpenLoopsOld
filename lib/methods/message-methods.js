
Meteor.methods({

	createMessage: function (message) {
		check(message, {
			type: String,
			text: String,
			subjectItemId: Match.Optional(String),
			boardId: String
		});
		message.timestamp = Date.now();
		message.userId = Meteor.userId();		

		var messageId = Messages.insert(message);

		return messageId;
	},

});