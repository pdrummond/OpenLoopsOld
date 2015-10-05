Template.actionStatusDropdown.onRendered(function() {
	$("#action-status-dropdown").dropdown();
});

Template.actionStatusDropdownItem.events({
	'click': function(e) {
		e.preventDefault();		
		var newStatus = this.value;
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateItemStatus', Session.get('selectedItemId'), newStatus);
		}
	}
});

Template.actionStatusDropdown.helpers({
	selectedActionStatusLabel: function() {
		var action = Items.findOne(Session.get('selectedItemId'));
		return OpenLoops.getItemStatusLabel(action);
	},

	selectedActionStatusColor: function() {
		var action = Items.findOne(Session.get('selectedItemId'));
		return OpenLoops.getItemStatusColor(action);
	}
})