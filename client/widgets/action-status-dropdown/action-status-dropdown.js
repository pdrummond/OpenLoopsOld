Template.actionStatusDropdown.events({
	'click .status.item': function(e) {
		e.preventDefault();		
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateItemStatus', Session.get('selectedAction')._id, newStatus);			
		}
	}
});

Template.actionStatusDropdown.helpers({
	selectedActionStatusLabel: function() {
		var action = Session.get('selectedAction');
		return OpenLoops.ActionStatusMeta[action.status].label || 'ERR: No Status';
	}
})