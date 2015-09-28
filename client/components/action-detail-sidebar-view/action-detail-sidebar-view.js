Template.actionDetailSidebarView.onRendered( function() {	
	/*this.editor = CodeMirror.fromTextArea( this.find( "#item-description-editor" ), {
		lineNumbers: false,
		fixedGutter: false,
		mode: "markdown",
		lineWrapping: true,
		indentWithTabs:false,
	});
	$(".CodeMirror").hide();*/
	$('.ui.dropdown').dropdown();	
});
Template.actionDetailSidebarView.helpers({
	itemIsAction: function() {
		return this.type == 'action';
	}
});

Template.actionDetailSidebarView.events({
	'click #fullscreen-description-link': function(event, template) {
		Session.set('zenEditorContent', $('#item-description-editor').val());
		Session.set('zenEditorTargetInput', '#item-description-editor');
		$("#zenEditor").show();
	},

	'click #edit-description-link': function(event, template) {
		if($("#item-description").is(":visible")) {
			$("#item-description").hide();
			$("#item-description-editor").show();
			$("#fullscreen-description-link").fadeIn();
			//$(".CodeMirror").show();
			$("#edit-description-link").html("<i class='save icon'></i> Save");
		} else {
			Meteor.call('updateItemDescription', Session.get('selectedItemId'), $('#item-description-editor').val());
			$("#item-description").show();
			$("#item-description-editor").hide();
			$("#fullscreen-description-link").fadeOut();
			//$(".CodeMirror").hide();
			$("#edit-description-link").html("<i class='pencil icon'></i> Edit");
		}
	},

	'click #full-screen-icon': function() {
		Router.go('/board/' + Session.get('currentBoardId') + '/action/' + this._id + "/description");		
	},

	'click #back-icon': function() {
		OpenLoops.showActionListTabInSidebar();
	},
	
	'keyup #comment-input': function(e) {
		e.stopPropagation();
		e.preventDefault();
		var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
		if (charCode == 13) {			
			var inputVal = $("#comment-input").val();
			if(inputVal != null && inputVal.length > 0) {				
				OpenLoops.createMessage(inputVal, this._id);
				$("#comment-input").val('');
			}	
		}
	}
});

Template.actionDetailMessages.helpers({
	actionMessages: function() {		
		return Messages.find({subjectItemId: this._id}, {sort: {timestamp: 1}});
	}
});

Template.actionDetailSidebarView.onRendered(function() {
	$('.menu .item').tab();
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});
});

Template.actionDetailSidebarView.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('itemMessages', {			
			boardId: Session.get('currentBoardId'),
			subjectItemId: this._id,			
			limit: Session.get('messageLimit'),
		}, function() {
			//Do nothing here.
		});
	});	
});

Template.moveToBoardItem.events({
	'click': function() {		
		Meteor.call('updateItemBoardId', Session.get('selectedItemId'), this._id, function(error, result) {
			if(error) {
				alert("updateItemBoardId Error");
			} else {
				OpenLoops.showActionListTabInSidebar();
			}
		});
	}
})