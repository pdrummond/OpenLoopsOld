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
		return this.itemType == 'action';
	},

	archiveMenuItemText: function() {
		return this.archived?"Restore Item":"Archive Item";
	},

	activeTab: function(tabName) {
		var activeTab = Session.get('actionDetailSidebarView.activeTab') || "description";
		return activeTab == tabName ? 'active':'';
	},

});

Template.actionDetailSidebarView.events({
	
	'click #description-tab': function() {
		Session.set('actionDetailSidebarView.activeTab', 'description');
	},

	'click #discussion-tab': function() {
		Session.set('actionDetailSidebarView.activeTab', 'discussion');
	},

	'click #details-tab': function() {
		Session.set('actionDetailSidebarView.activeTab', 'details');
	},

	'click #archive-item-menu-item': function() {
		Meteor.call('updateItemArchived', this._id, !this.archived);
	},

	'click #rename-item-menu-item': function() {
		var title = prompt("Enter new title", this.title);
		if(title != null && title.length > 0) {
			Meteor.call('updateItemTitle', this._id, title);
		}
	},

	'click #change-item-members-menu-item': function() {
		var members = prompt("Set members:", this.members.join(','));
		if(members != null && members.length > 0) {
			if(members != null && members.length > 0) {
				var memberList = [];
				if(members.indexOf(',') != -1) {
					memberList = members.split(',');
				} else {
					memberList.push(members);
				}
				Meteor.call('updateItemMembers', this._id, memberList);
			}
		}
	},
	

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
				OpenLoops.setItemSidebarTab('discussion');
				Meteor.setTimeout(function() {
					OpenLoops.scrollToBottomOfComments();
				}, 10);
			}	
		}
	},

	'click #full-screen-comment-input': function() {
		Session.set('zenEditorContent', $('#comment-input').val());
		Session.set('zenEditorTargetInput', '#comment-input');
		$("#zenEditor").show();
	},
});

Template.itemComments.helpers({
	itemComments: function() {		
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