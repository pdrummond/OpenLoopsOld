
Template.actionDetailPage.onCreated(function() {
	setTimeout(function() {
		var selectedCommentId = Session.get('selectedCommentId');
		if(selectedCommentId != null) {
			OpenLoops.scrollToElement('#comments-section', '#' + selectedCommentId);
		}
	}, 50);
});

Template.actionDetailPage.onRendered(function() {
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});	
});

Template.actionDetailPage.helpers({
	isButtonActive: function(data) {
		return data.hash.buttonName == Session.get('currentSection')?'active':'';
	},

	isSectionActive: function(data) {
		return data.hash.section == Session.get('currentSection')?'block':'none';
	}
});

Template.actionDetailPage.events({
	'click .task.message .header': function() {
		var channel = Session.get('channel') || "general";
		Router.go('/board/' + Session.get('currentBoard')._id + "/channel/" + channel + "/messages");
	},

	'click #description-button': function() {
		Router.go("/board/" + Session.get('currentBoard')._id + "/action/" + Session.get('selectedAction')._id + "/description");
	},
	'click #comments-button': function() {
		Router.go("/board/" + Session.get('currentBoard')._id + "/action/" + Session.get('selectedAction')._id + "/comments");
	},
	'click #activity-button': function() {
		Router.go("/board/" + Session.get('currentBoard')._id + "/action/" + Session.get('selectedAction')._id + "/activity");
	},

	'click #edit-description': function() {
		Session.set("currentSection", 'description');		
		$(".preview-wrap").toggleClass('full-width');
	},

	'dblclick .preview-wrap': function() {		
		$(".preview-wrap").toggleClass('full-width');			
	},	
});

Template.taskDetailMilestoneItem.events({
	'click': function() {		
		Meteor.call('updateMessageMilestoneId', Session.get('selectedAction')._id, this._id, Session.get('channel'));
	}
})

Template.editor.onRendered( function() {
	Meteor.promise( "convertMarkdown", this.description).then( function( html ) {
		$( "#preview" ).html( html );
	});
	this.editor = CodeMirror.fromTextArea( this.find( "#editor" ), {
		lineNumbers: false,
		fixedGutter: false,
		mode: "markdown",
		lineWrapping: true,
		indentWithTabs:false,
		//cursorHeight: 0.85,
		placeholder: "Type Description here"
	});
});

Template.editor.events({
	'keyup .CodeMirror': function( event, template ) {
		var text = template.editor.getValue();

		if ( text !== "" ) {	
			var self = this;
			Meteor.promise( "convertMarkdown", text)
			.then( function( html ) {
				$( "#preview" ).html( html );
				return Meteor.promise( "updateActionDescription", self._id, text);
			})
			.catch( function( error ) {
				Bert.alert( error.reason, "danger" );
			});
		}
	}
});


Template.comments.events({
	'click #comment-reply-form-submit': function() {
		var text = $("#comment-reply-textarea").val();
		if(text && text.length > 0) {
			Meteor.call('createComment', {
				boardId: Session.get('currentBoard')._id,
				actionId: Session.get('selectedAction')._id, 
				text: text
			});
		}
	}
});

Template.comments.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('comments', {			
			actionId: Session.get('selectedAction')._id,
			//limit: Session.get('commentLimit'), 
		}, function() {			
		});
	});
});