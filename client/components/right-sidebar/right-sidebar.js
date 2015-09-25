
Template.rightSidebar.helpers({
	rightSidebarTemplate: function() {
		return Session.get('rightSidebarTemplate') || 'actions';
	}
});

Template.actionDetailSidebarView.helpers({
	selectedSidebarAction: function() {
		return Items.findOne(Session.get('selectedItemId'));
	},

});

Template.actions.onRendered(function() {
	this.$('.menu .item').tab();	
});


Template.actions.helpers({

	activeTab: function(tabName) {
		return Session.get('activeActionTab') == tabName ? 'active':'';
	},

	actions: function() {  	
		return Items.find({boardId: Session.get('currentBoardId'), itemType: 'action'}, {sort: {timestamp: 1}});
	},

	actionCount: function() {
		return Items.find({archived:false}).count();	
	},

	archivedCount: function() {
		return Items.find({archived:true}).count();	
	},
	
	filterString: function() {
		return Session.get('filterString');
	},

});

Template.actions.events({
	
	'click #actions-tab': function() {
		Session.set('activeActionTab', 'actions');
	},
	'click #people-tab': function() {
		Session.set('activeActionTab', 'people');
	},

	'keyup .input-box_filter': function(e) {
		OpenLoops.onFilterInput();
	},

	'click #create-filter-button': function() {
		var title = prompt("Tab Name");
		if(title != null) {
			var query = $(".input-box_filter").val();
			if(query != null && query.length > 0) {
				Meteor.call('createFilter', {
					boardId: Session.get('currentBoardId'),
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
	},

	'click #clear-all-filters': function() {
		Session.set('filterString', '');
	},

	'click #my-open-tasks-filter': function() {
		Session.set('filterString', 'member:' + Meteor.user().username + ' type:task status:open');
	},

	'click #all-open-bugs-filter': function() {
		Session.set('filterString', 'type:bug status:open');
	},

	'click #all-archived-actions': function() {
		Session.set('filterString', 'archived:true');
	}

});

Template.actionArchivedChangeActivity.helpers({
	archivedOrRestored: function() {
		return this.action.archived == true? 'archived':'restored';
	}
});