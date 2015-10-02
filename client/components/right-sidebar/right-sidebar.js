
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
	this.$('.ui.dropdown').dropdown({
		action:'hide'
	});
});

Template.actions.helpers({

	actions: function() {  			
		return Items.find(
			_.extend({boardId: Session.get('currentBoardId'), archived:false, itemType: 'action'}, 
				OpenLoops.getActionFilter(Session.get('actionFilterString'))), 
			{sort: {order: 1}});
	},

	activeTab: function(tabName) {
		return Session.get('activeActionTab') == tabName ? 'active':'';
	},


	actionCount: function() {
		return Items.find({archived:false}).count();	
	},

	archivedCount: function() {
		return Items.find({archived:true}).count();	
	},
	
	actionFilterString: function() {
		return Session.get('actionFilterString');
	},

	activeUsers: function() {
		return Presences.find();
	},

	sortableOptions: function () {
		return {
			onSort: function(event) {
				if(event.oldIndex != event.newIndex) {
					Meteor.call('createActivity', {
						activityType: 'item-reordered-activity',
						item: event.data,
						oldIndex: event.oldIndex+1,
						newIndex: event.newIndex+1,				
						boardId: event.data.boardId
					});
				}
			}
		};
	}

});

Template.actions.events({
	
	'click #actions-tab': function() {
		Session.set('activeActionTab', 'actions');
	},

	'click #labels-tab': function() {
		Session.set('activeActionTab', 'labels');
	},

	'click #people-tab': function() {
		Session.set('activeActionTab', 'people');
	},

	'keyup .input-box_filter': function(e) {		
		OpenLoops.onActionFilterInput();
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
		Session.set('actionFilterString', null);
	},

	'click #delete-filter-button': function() {
		var filter = Session.get('currentFilter');
		if(filter != null) {
			Meteor.call('deleteFilter', filter._id);
		}
	},

	'click #clear-all-filters': function() {
		Session.set('actionFilterString', '');
	},

	'click #all-my-actions-filter': function() {
		Session.set('actionFilterString', 'member:' + Meteor.user().username);
	},

	'click #my-open-tasks-filter': function() {
		Session.set('actionFilterString', 'member:' + Meteor.user().username + ' type:task status:open');
	},

	'click #all-open-bugs-filter': function() {
		Session.set('actionFilterString', 'type:bug status:open');
	},

	'click #all-archived-actions': function() {
		Session.set('actionFilterString', 'archived:true');
	},

	'click #new-label-button': function() {
		var title = prompt("Label Title:");
		if(title != null && title.length > 0) {
			title = slugify(title);
			var description = prompt("Label Description:")
			var color = prompt("Label Color:");
			Meteor.call('createLabel', {_id: title, description: description, color:color});
		}
	}

});

Template.itemArchivedChangeActivity.helpers({
	archivedOrRestored: function() {
		return this.item.archived == true ? 'archived':'restored';
	}
});

Template.labelItem.events({
	'click': function() {
		OpenLoops.showActionListTabInSidebar({filter: "label:" + this._id});
	}
})