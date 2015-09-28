
Meteor.methods({

	createItem: function (item) {
		check(item, {
			type: String,
			itemType: String,
			title: String,
			text: Match.Optional(String),
			members: Match.Optional([String]),
			subjectItemId: Match.Optional(String),
			boardId: String
		});
		item.timestamp = Date.now();
		item.userId = Meteor.userId();		
		item.status = item.status || 'new';
		item.archived = false;
		item.sid = Meteor.isServer?incrementCounter(Counters, item.boardId):0;

		var itemId = Items.insert(item);

		item = Items.findOne(itemId);

		Meteor.call('createActivity', {
			activityType: (item.type === 'post'? 'create-post' : 'create-item'),
			item: item, 
			boardId: item.boardId,			
		});

		_.each(item.members, function(member) {
			var toUser = Meteor.users.findOne({username: member});
			if(toUser != null) {
				Meteor.call('createNotification', {
					type: 'new-item-member',
					itemType: item.type,
					fromUserId: item.userId,
					toUserId: toUser._id,
					itemId: itemId
				});
			}
		});

		return itemId;
	},

	updateItemTitle: function(itemId, newTitle, channel) {    
		var item = Items.findOne(itemId);
		var oldTitle = item.title;
		Items.update(itemId, {
			$set: {
				title: newTitle, 
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'title'
			}
		});
		var item = Items.findOne(itemId);

		Meteor.call('createActivity', {
			activityType: 'item-attr-change',
			item: item,
			attr: 'title',
			itemOldAttr: oldTitle,
			itemNewAttr: newTitle,
			boardId: item.boardId,
			channel: channel,
			activityChannel: channel
		});
	},

	updateItemDescription: function(itemId, newDescription) {
		Items.update(itemId, {
			$set: {
				text: newDescription,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'description'				
			}
		});
	},

	updateItemStatus: function(itemId, newStatus) {
		var item = Items.findOne(itemId);
		var oldStatus = item.status;
		Items.update(itemId, {
			$set: {
				status: newStatus,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'status'
			}
		});
		var item = Items.findOne(itemId);

		Meteor.call('createActivity', {
			activityType: 'action-attr-change',        
			action: item,
			attr:'status',
			actionOldAttr: oldStatus,
			actionNewAttr: newStatus,
			boardId: item.boardId
		});
	},

	updateItemArchived: function(itemId, newArchived, channel) {    
		Items.update(itemId, {
			$set: {
				archived: newArchived,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'archived'				
			}
		});
		var item = Items.findOne(itemId);

		Meteor.call('createActivity', {
			activityType: 'item-archived-change',
			item: item,
			boardId: item.boardId,
			channel: channel,
			activityChannel: channel,
		});
	},
});
