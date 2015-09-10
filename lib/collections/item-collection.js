Items = new Mongo.Collection("items");

if(Meteor.isServer) {
	Meteor.publish('items', function (opts) {    
		var sub = this;
		var handle = Items.find(opts.filter, {limit: opts.limit, sort: {timestamp: -1}}).observeChanges({
			added: function(id, item) {	
				console.log("BOOM! Item " + id + " added");
				sub.added('items', id, item);
			},
			changed: function(id, fields) {
				sub.changed('items', id, fields);
			},
			removed: function(id) {
				sub.removed('items', id);
			}
		});
		sub.ready();
		sub.onStop(function() { handle.stop(); });
	});
}

Meteor.methods({

	createItem: function (item) {
		check(item, {
			type: String,
			subType: String,
			text: String,
			subject: Match.Optional(String),
			boardId: String
		});
		item.timestamp = Date.now();
		item.userId = Meteor.userId();		
		item.status = item.status || 'new';
		item.archived = false;
		item.sid = Meteor.isServer?incrementCounter(Counters, item.boardId):0;

		var itemId = Items.insert(item);

		item = Items.findOne(itemId);

		/*Meteor.call('createActivity', {
			activityType: 'create-item',
			item: item, 
			boardId: item.boardId,
			channel: item.channel
		});*/
return itemId;
},

updateItemTitle: function(itemId, newTitle, channel) {    
	var item = Items.findOne(itemId);
	var oldTitle = item.title;
	Items.update(itemId, {$set: {title: newTitle}});
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
	Items.update(itemId, {$set: {description: newDescription}});
},

updateItemStatus: function(itemId, newStatus, channel) {    
	var item = Items.findOne(itemId);
	var oldStatus = item.status;
	Items.update(itemId, {$set: {status: newStatus}});
	var item = Items.findOne(itemId);

	Meteor.call('createActivity', {
		activityType: 'item-attr-change',        
		item: item,
		attr:'status',
		itemOldAttr: oldStatus,
		itemNewAttr: newStatus,
		boardId: item.boardId,
		channel: channel,
		activityChannel: channel,
	});
},

updateItemMilestoneId: function(itemId, milestoneId, channel) {
	var item = Items.findOne(itemId);
	var oldMilestone;
	var oldMilestoneTitle;
	if(item.milestoneId) {
		oldMilestone = Milestones.findOne(item.milestoneId);
		oldMilestoneTitle = oldMilestone.title;
	}
	Items.update(itemId, {$set: {milestoneId: milestoneId}});
	var newMilestone = Milestones.findOne(milestoneId);
	var newMilestoneTitle = newMilestone.title;

	Meteor.call('createActivity', {
		activityType: 'item-attr-change',
		item: item,
		attr: 'milestone',
		itemOldAttr: oldMilestoneTitle,
		itemNewAttr: newMilestoneTitle,
		boardId: item.boardId,
		channel: channel,
		activityChannel: channel,
	});
},

updateItemArchived: function(itemId, newArchived, channel) {    
	Items.update(itemId, {$set: {archived: newArchived}});
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
