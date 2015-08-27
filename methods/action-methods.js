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

	updateActionDescription:function(actionId, newDescription) {
		Actions.update(actionId, {$set: {description: newDescription}});
	},

	updateActionStatus:function(actionId, newStatus, channel) {    
		var action = Actions.findOne(actionId);
		var oldStatus = action.status;
		Actions.update(actionId, {$set: {status: newStatus}});
		var action = Actions.findOne(actionId);

		Meteor.call('createActivity', {
			activityType: 'action-status-change',        
			action: action,
			actionOldStatus: oldStatus,
			actionNewStatus: newStatus,
			boardId: action.boardId,
			activityChannel: channel,
		});
	},
});
