
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
		item.order = Items.find().count() + 1;
		item.sid = Meteor.isServer?incrementCounter(Counters, "pod-unique-counter"):0;
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

	updateItemTitle: function(itemId, newTitle) {    
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
			boardId: item.boardId
		});
	},

	updateItemDescription: function(itemId, newDescription) {
		var item = Items.findOne(itemId);
		var oldDescription = item.text;
		Items.update(itemId, {
			$set: {
				text: newDescription,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'description'				
			}
		});

		Meteor.call('createActivity', {
			activityType: 'item-attr-change',        
			item: item,
			attr:'description',
			itemOldAttr: oldDescription,
			itemNewAttr: newDescription,
			boardId: item.boardId
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
			activityType: 'item-attr-change',        
			item: item,
			attr:'status',
			itemOldAttr: oldStatus,
			itemNewAttr: newStatus,
			boardId: item.boardId
		});
	},

	updateItemBoardId: function(itemId, toBoardId) {
		var item = Items.findOne(itemId);
		var fromBoardId = item.boardId;

		var defaultStatusValue = OpenLoops.getBoardDefaultStatusValue(toBoardId);


		Items.update(itemId, {
			$set: {
				boardId: toBoardId,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'boardId',
				status: defaultStatusValue,
			}
		});
		var item = Items.findOne(itemId);

		Meteor.call('createActivity', {
			activityType: 'item-moved-from-board-activity',        
			item: item,
			fromBoardId: fromBoardId,
			toBoardId: toBoardId,
			boardId: fromBoardId,
		});
		Meteor.call('createActivity', {
			activityType: 'item-moved-to-board-activity',
			item: item,
			fromBoardId: fromBoardId,
			toBoardId: toBoardId,
			boardId: toBoardId,
		});

	},

	updateItemArchived: function(itemId, newArchived) {    
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
			boardId: item.boardId
		});
	},

	updateItemMembers: function(itemId, newMembers) { 
		var item = Items.findOne(itemId);
		var oldMembers = item.members;
		Items.update(itemId, {
			$set: {
				members: newMembers,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'members'
			}
		});

		Meteor.call('createActivity', {
			activityType: 'item-attr-change',        
			item: item,
			attr:'members',
			itemOldAttr: oldMembers.join(","),
			itemNewAttr: newMembers.join(","),
			boardId: item.boardId
		});
	},

	updateItemLabels: function(itemId, newLabels) {
		var item = Items.findOne(itemId);
		var oldLabels = item.labels;
		Items.update(itemId, {
			$set: {
				labels: newLabels,
				updatedAt: Date.now(), 
				updatedBy: Meteor.userId(),
				updatedAttr: 'labels'
			}
		});

		Meteor.call('createActivity', {
			activityType: 'item-attr-change',        
			item: item,
			attr:'labels',
			itemOldAttr: oldLabels.join(","),
			itemNewAttr: newLabels.join(","),
			boardId: item.boardId
		});
	},


	reorderAllItems: function() {
		var order = 0;
		Items.find().forEach(function(item) {
			Items.update(item._id, {$set: {order: ++order}});
		});
	}
});
