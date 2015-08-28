
Template.actions.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('actions', {
			filter: OpenLoops.getFilter(Session.get('filterString')),
			board: Session.get('currentBoard'),
			channel: Session.get('channel'),
			limit: Session.get('actionLimit'),
		});
	});	
});

Template.actions.onRendered(function() {
	this.$('.menu .item').tab();	
});


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
	milestoneLabel: function() {
		var milestone =  Milestones.findOne(this.milestone);
		return milestone?milestone.title:'No Milestone';
	},	
});

Template.actionItem.events({
	'click .action .header': function() {
		Router.go('/board/' + Session.get('currentBoard')._id + '/action/' + this._id + "/description");	
	}
});

Template.actionArchivedChangeActivity.helpers({
	archivedOrRestored: function() {
		return this.action.archived == true? 'archived':'restored';
	}
});