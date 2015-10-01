Template.actionStatusDropdown.onRendered(function() {
	$("#action-status-dropdown").dropdown();
});

Template.actionStatusDropdown.events({
	'click .status.item': function(e) {
		e.preventDefault();		
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateItemStatus', Session.get('selectedItemId'), newStatus);
		}
	}
});

Template.actionStatusDropdown.helpers({
	selectedActionStatusLabel: function() {
		var action = Items.findOne(Session.get('selectedItemId'));
		return OpenLoops.ActionStatusMeta[action.status].label || 'ERR: No Status';
	},

	selectedActionStatusColor: function() {
		var action = Items.findOne(Session.get('selectedItemId'));
		return OpenLoops.ActionStatusMeta[action.status].color || 'ERR: No Color';
	}
})