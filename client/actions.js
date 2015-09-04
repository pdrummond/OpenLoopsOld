
Template.rightSidebar.helpers({
	rightSidebarTemplate: function() {
		return Session.get('rightSidebarTemplate') || 'actions';
	}
});

Template.actionDetailSidebarView.helpers({
	selectedSidebarAction: function() {
		return Session.get('selectedAction');
	},

});

Template.actionDetailMessages.helpers({

	messages: function() {	
		console.log("getting action detail comments");	
		return Messages.find({channel: Session.get('selectedAction').channel});
	}

});

Template.actionDetailSidebarView.events({
	'click #full-screen-icon': function() {
		//Router.go('/board/' + Session.get('currentBoard')._id + '/action/' + this._id + "/description");
		Session.set('messageLimit', 30);
		Session.set('filterString', '');
		Router.go("/board/" + Session.get('currentBoard')._id + "/channel/" + this.channel + "/messages");
	},

	'click #back-icon': function() {
		Session.set('rightSidebarTemplate', 'actions');
	},
	
	'click .status.item': function(e) {
		e.preventDefault();		
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateActionStatus', this._id, newStatus, Session.get('channel'));
		}
	}
});

Template.actionDetailSidebarView.onRendered(function() {
	this.$('.ui.accordion').accordion();
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});
});

Template.actionDetailSidebarView.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('actionDetailMessages', {			
			board: Session.get('currentBoard'),
			channel: Session.get('selectedAction').channel,
			limit: Session.get('messageLimit'),
		}, function() {
			//Do nothing here.
		});
	});	
});

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

	activeTab: function(tabName) {
		return Session.get('activeActionTab') == tabName? 'active':'';
	},

	actions: function() {  	
		return Actions.find({}, {sort: {timestamp: 1}});
	},

	actionCount: function() {
		return Actions.find({archived:false}).count();	
	},

	archivedCount: function() {
		return Actions.find({archived:true}).count();	
	},
	
	filterString: function() {
		return Session.get('filterString');
	},

});

Template.actions.events({
	
	'click #actions-tab': function() {
		Session.set('activeActionTab', 'actions');
	},
	'click #milestones-tab': function() {
		Session.set('activeActionTab', 'milestones');
	},
	'click #labels-tab': function() {
		Session.set('activeActionTab', 'labels');
	},
	'click #searches-tab': function() {
		Session.set('activeActionTab', 'searches');
	},

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
		Session.set('rightSidebarTemplate', 'actionDetailSidebarView');
		Session.set('selectedAction', this);
	}
});

Template.actionArchivedChangeActivity.helpers({
	archivedOrRestored: function() {
		return this.action.archived == true? 'archived':'restored';
	}
});