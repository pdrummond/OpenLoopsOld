
Template.actionDetailPage.onCreated(function() {
	setTimeout(function() {
		var selectedCommentId = Session.get('selectedCommentId');
		if(selectedCommentId != null) {
			OpenLoops.scrollToElement('#comments-section', '#' + selectedCommentId);
		}
	}, 50);
});

Template.actionDetailPage.onRendered(function() {
/*	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});	*/
});

Template.actionDetailPage.helpers({
	isButtonActive: function(data) {
		return data.hash.buttonName == Session.get('currentSection')?'active':'';
	},

	isSectionActive: function(data) {
		return data.hash.section == Session.get('currentSection')?'block':'none';
	},	
});

Template.actionDetailPage.events({

	'click #archived-check': function() {
		this.archived = !this.archived;
		Meteor.call('updateActionArchived', this._id, this.archived, Session.get('channel'));
	},

	'click #back-icon': function() {
		var channel = Session.get('channel') || "general";
		Router.go('/board/' + Session.get('currentBoardId') + "/channel/" + channel + "/messages");		
	},

	'dblclick #action-title': function() {
		$("#action-title").hide();
		$("#action-title-input").show();		
	},

	'keyup #action-title-input': function(e) {
		var inputVal = $('#action-title-input').val();
		if(!!inputVal) {
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if (charCode == 13) {
				e.stopPropagation();
				Meteor.call('updateActionTitle', this._id, inputVal, Session.get('channel'));
				$("#action-title").show();
				$("#action-title-input").hide();
			}
		}
	},	

	'click #description-button': function() {
		Router.go("/board/" + Session.get('currentBoardId') + "/action/" + Session.get('selectedAction')._id + "/description");
	},
	'click #comments-button': function() {
		Router.go("/board/" + Session.get('currentBoardId') + "/action/" + Session.get('selectedAction')._id + "/comments");
	},
	'click #activity-button': function() {
		Router.go("/board/" + Session.get('currentBoardId') + "/action/" + Session.get('selectedAction')._id + "/activity");
	},

	'click #edit-description': function(e) {
		doEditMode(e);
	},

	'dblclick .preview-wrap': function(e) {		
		doEditMode(e);		
	},	

	'click .status.item': function(e) {
		e.preventDefault();		
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateActionStatus', this._id, newStatus, Session.get('channel'));
		}
	}
});

Template.milestoneMenuItem.events({
	'click': function() {		
		Meteor.call('updateActionMilestoneId', Session.get('selectedAction')._id, this._id, Session.get('channel'));
	}
});
Template.comments.events({
	'click #comment-reply-form-submit': function() {
		var text = $("#comment-reply-textarea").val();
		if(text && text.length > 0) {
			Meteor.call('createComment', {
				boardId: Session.get('currentBoardId'),
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


doEditMode = function(e) {
	e.preventDefault();
	$(".preview-wrap").toggleClass('full-width');
	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else if (document.selection) {  // IE?
		document.selection.empty();
	}
}