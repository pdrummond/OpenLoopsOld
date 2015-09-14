Template.createItemForm.helpers({
	createItemFormLabel: function() {
		return Session.get('createItemForm.label');
	}
});

Template.createItemForm.events({
	'click #cancel-button': function(e) {
		e.preventDefault();
		Session.set('rightSidebarTemplate', Session.get('previousRightSidebarTemplate') || 'actions');
	}
})