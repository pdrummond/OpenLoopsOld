Template.createItemForm.onRendered(function() {
	$("#new-item-title-input").focus();
	$('#member-dropdown').dropdown({allowAdditions: true});
	
	this.$('#description-field').toggle(Session.get('createItemForm.type') != 'article');
});

Template.createItemForm.helpers({
	createItemFormLabel: function() {
		return Session.get('createItemForm.label');
	},

	itemIcon: function() {
		return OpenLoops.getItemIcon({type: Session.get('createItemForm.type')})
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
		if(type == 'article') itemType = 'article';

		var title = $("#createItemForm input[name='title']").val(); 
		var description = $("#createItemForm textarea[name='description']").val();
		var members = $("#createItemForm input[name='members']").val();
		if(title != null && title.length > 0) {
			OpenLoops.createItem(type, itemType, title, description, members, Session.get('newSubjectItemId'));
			Session.set('rightSidebarTemplate', Session.get('previousRightSidebarTemplate') || 'actions');
		}
	}
});