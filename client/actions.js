Template.actions.helpers({
	actions: function() {  	
		return Actions.find({}, {sort: {timestamp: 1}});
	},

	actionCount: function() {
		return Actions.find().count();	
	},
	
	filterString: function() {
		return Session.get('filterString');
	},

});

Template.actions.events({
	'keyup .input-box_filter': function(e) {
		OpenLoops.onFilterInput(e);
	},

	'click #create-filter-button': function() {
		var title = prompt("Tab Name");
		if(title != null) {
			var query = $(".input-box_filter").val();
			if(query != null && query.length > 0) {
				Meteor.call('createFilter', {
					boardId: Session.get('currentBoard')._id,
					channel: Session.get('channel'),
					title: title, 
					query: query					
				});
			}
		}
	},

	'click #messages-filter-item': function() {
		Session.set('filterString', null);
	},

	'click #delete-filter-button': function() {
		var filter = Session.get('currentFilter');
		if(filter != null) {
			Meteor.call('deleteFilter', filter._id);
		}
	}
});

Template.actionItem.onRendered(function() {
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});
});

Template.actionItem.helpers({
	actionUid: function() {
		return "#" + Boards.findOne(this.boardId).prefix + "-" + this.uid;
	},	

	milestoneLabel: function() {
		var milestone =  Milestones.findOne(this.milestone);
		return milestone?milestone.title:'No Milestone';
	},

	statusLabel: function() {		
		return ActionStatus[this.status].label;
	},

	statusColor: function() {
		return ActionStatus[this.status].color || '';
	},	

	actionIcon: function() {
		switch(this.type) {
			case 'task': return 'check circle outline'; 
			case 'bug': return 'bug';
			default: return 'circle';
		}
	}
});

Template.actionItem.events({
	'click .action .header': function() {
		Router.go('/board/' + Session.get('currentBoard')._id + '/action/' + this._id + "/description");	
	}
})

ActionStatus = {
	'new': {label: 'New', color: 'teal'},
	'open': {label: 'Open', color: 'green'},
	'in-progress': {label: 'In Progress', color: 'purple'},
	'blocker': {label: 'Blocker', color: 'red'},
	'in-test': {label: 'In-Test', color: 'yellow'},
	'done': {label: 'Done', color: 'blue'}
}
