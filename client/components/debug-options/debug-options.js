Template.debugOptions.events({

	'click #reorder-all-items-button': function() {
		Meteor.call('reorderAllItems');
	},

	'click #remove-board-prefix-fields-button': function() {
		Meteor.call('removeBoardPrefixFields')
	}
});