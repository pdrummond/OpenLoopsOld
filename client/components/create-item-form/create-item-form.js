Template.createItemForm.helpers({
	createItemFormLabel: function() {
		return Session.get('createItemForm.label');
	}
});

Template.createItemForm.events({
	'click #cancel-button': function(e) {
		e.preventDefault();
		Session.set('rightSidebarTemplate', Session.get('previousRightSidebarTemplate') || 'actions');
	},

	'click #submit-button': function(e) {
		e.preventDefault();

		var type = Session.get('createItemForm.type');
		
		var itemType = 'action';
		if(type == 'discussion') itemType = 'discussion';
		if(type == 'post') itemType = 'post';

		var title = $("#createItemForm input[name='title']").val(); 
		var description = $("#createItemForm textarea[name='description']").val();
		if(title != null && title.length > 0) {
			OpenLoops.createItem(type, itemType, title, description, Session.get('newSubjectItemId'), function(error, result) {
				if(error) {
					alert("Error: " + error);
				}
			});
			Session.set('rightSidebarTemplate', Session.get('previousRightSidebarTemplate') || 'actions');
		}
	}
})