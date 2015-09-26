
Meteor.methods({

	createNotification: function (notification) {

		if(notification.fromUserId != notification.toUserId) {
			check(notification, {
				type: String,
				fromUserId: String,
				toUserId: String,
				itemType: Match.Optional(String),
				messageId: Match.Optional(String),
				itemId: Match.Optional(String),
			});		
			notification.timestamp = Date.now();
			notification.isRead = false;
			Notifications.insert(notification);
		}
	},

	deleteNotification: function(notificationId) {
		check(notificationId, String);
		Notifications.remove(notificationId);
	}

});