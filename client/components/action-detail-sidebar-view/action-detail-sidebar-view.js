Template.actionDetailSidebarView.onRendered( function() {
	this.editor = CodeMirror.fromTextArea( this.find( "#item-description-editor" ), {
		lineNumbers: false,
		fixedGutter: false,
		mode: "markdown",
		lineWrapping: true,
		indentWithTabs:false,
	});
	$(".CodeMirror").hide();	
});

Template.actionDetailSidebarView.events({
	'click #edit-description-link': function(event, template) {
		if($("#item-description").is(":visible")) {
			$("#item-description").hide();
			$(".CodeMirror").show();
			$("#edit-description-link").html("<i class='save icon'></i> Save");
		} else {
			Meteor.call('updateItemDescription', Session.get('selectedItemId'), template.editor.getValue());
			$("#item-description").show();
			$(".CodeMirror").hide();
			$("#edit-description-link").html("<i class='pencil icon'></i> Edit");
		}
	},

	'click #full-screen-icon': function() {
		Router.go('/board/' + Session.get('currentBoard')._id + '/action/' + this._id + "/description");		
	},

	'click #back-icon': function() {
		Session.set('rightSidebarTemplate', 'actions');
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
			board: Session.get('currentBoard'),
			subjectItemId: this._id,			
			limit: Session.get('messageLimit'),
		}, function() {
			//Do nothing here.
		});
	});	
});