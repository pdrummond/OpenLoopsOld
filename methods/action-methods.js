Meteor.methods({

	createAction: function (action) {
		action.timestamp = Date.now();
		action.userId = Meteor.userId();
		action.status = action.status || 'new';      
		action.archived = false;
		action.uid = Meteor.isServer?incrementCounter(Counters, action.boardId):0;

		var actionId = Actions.insert(action);

		action = Actions.findOne(actionId);

		Meteor.call('createActivity', {
			activityType: 'create-action',
			action: action, 
			boardId: action.boardId,
			channel: action.channel
    	});

    	var channelId = Meteor.call('createChannel', {boardId: action.boardId, type: 'action-channel', name: action.title, action: action});
    	var channel = Channels.findOne(channelId);

    	Actions.update(actionId, {$set: {channel: channel.name}});

		return actionId;
	},

	updateActionTitle:function(actionId, newTitle, channel) {    
		var action = Actions.findOne(actionId);
		var oldTitle = action.title;
		Actions.update(actionId, {$set: {title: newTitle}});
		var action = Actions.findOne(actionId);

		Meteor.call('createActivity', {
			activityType: 'action-attr-change',
			action: action,
			attr: 'title',
			actionOldAttr: oldTitle,
			actionNewAttr: newTitle,
			boardId: action.boardId,
			channel: channel,
			activityChannel: channel
		});
	},

	updateActionDescription:function(actionId, newDescription) {
		Actions.update(actionId, {$set: {description: newDescription}});
	},

	updateActionStatus:function(actionId, newStatus, channel) {    
		var action = Actions.findOne(actionId);
		var oldStatus = action.status;
		Actions.update(actionId, {$set: {status: newStatus}});
		var action = Actions.findOne(actionId);

		Meteor.call('createActivity', {
			activityType: 'action-attr-change',        
			action: action,
			attr:'status',
			actionOldAttr: oldStatus,
			actionNewAttr: newStatus,
			boardId: action.boardId,
			channel: channel,
			activityChannel: channel,
		});
	},

	updateActionMilestoneId:function(actionId, milestoneId, channel) {
		var action = Actions.findOne(actionId);
		var oldMilestone;
		var oldMilestoneTitle;
		if(action.milestoneId) {
			oldMilestone = Milestones.findOne(action.milestoneId);
			oldMilestoneTitle = oldMilestone.title;
		}
		Actions.update(actionId, {$set: {milestoneId: milestoneId}});
		var newMilestone = Milestones.findOne(milestoneId);
		var newMilestoneTitle = newMilestone.title;

		Meteor.call('createActivity', {
			activityType: 'action-attr-change',
			action: action,
			attr: 'milestone',
			actionOldAttr: oldMilestoneTitle,
			actionNewAttr: newMilestoneTitle,
			boardId: action.boardId,
			channel: channel,
			activityChannel: channel,
		});
	},

	updateActionArchived:function(actionId, newArchived, channel) {    
		Actions.update(actionId, {$set: {archived: newArchived}});
		var action = Actions.findOne(actionId);

		Meteor.call('createActivity', {
			activityType: 'action-archived-change',
			action: action,
			boardId: action.boardId,
			channel: channel,
			activityChannel: channel,
		});
	},
});
