Meteor.methods({

	createAction: function (action) {
		action.timestamp = Date.now();
		action.userId = Meteor.userId();
		action.status = action.status || 'new';      
		action.uid = Meteor.isServer?incrementCounter(Counters, action.boardId):0;

		var actionId = Actions.insert(action);

		Meteor.call('createActivity', {
			activityType: 'create-action',
			action: Actions.findOne(actionId),
			boardId: action.boardId,	
    	});

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
			activityChannel: channel,
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
			activityChannel: channel,
		});
	},
});
