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
});
