Template.comments.onRendered(function() {
	/*this.editor = CodeMirror.fromTextArea( this.find( "#comment-reply-textarea" ), {
		lineNumbers: false,
		fixedGutter: false,
		mode: "markdown",
		lineWrapping: true,
		indentWithTabs:false,
		//cursorHeight: 0.85,
		placeholder: "Type Comment here"
	});*/
});

Template.message.onRendered(function() {
	//This code makes messages from the same person as the previous message
	//have the 'same' class which hides the user profile and other classes to the
	//text flows.  Currently, it's not quite good enough so disabling for now until
	//I can work on it more and give it some polish. Issues are:
	// - There is a flicker for a couple of ms where the profile image is shown
	// - The time of the previous msg isn't taken into account.  Messages should only
	// - be joined if there were created within a certain period. 
	/*var self = this;
	Meteor.setTimeout(function() {
		if(self.$('.message').prev('.chat.message').attr('data-userid') == self.data.userId) {
			self.$('.message').addClass("same");
		} else {
			self.$('.message').removeClass("same");
		}
	}, 0);*/	
});

Template.message.events({
	'click .subject-label': function() {
		Session.set('newSubjectItemId', this.subjectItemId);
		Session.set('newSubjectItemType', Items.findOne(this.subjectItemId).type);
		$("#message-input").focus();
		//Session.set('messageFilterString', "[" + this.subject + "]");
	},

	'click': function() {		
		$(".message[data-messageid='" + this._id + "']").removeClass('new-message');
	}
});

Template.createPostActivity.events({
	'click .activity-subject-label': function() {		
		Session.set('newSubjectItemId', this.item._id);
		Session.set('newSubjectItemType', this.item.type);
		$("#message-input").focus();
	},

	'click .sid-label': function() {
		Session.set('rightSidebarTemplate', 'actionDetailSidebarView');
		Session.set('selectedItemId', this.item._id);
	},

	'click': function() {		
		$(".message[data-messageid='" + this._id + "']").removeClass('new-message');
	}
});

Template.createItemActivity.events({
	'click .activity-subject-label': function() {		
		Session.set('newSubjectItemId', this.item._id);
		Session.set('newSubjectItemType', this.item.type);
		$("#message-input").focus();
	},

	'click .sid-label': function() {
		Session.set('rightSidebarTemplate', 'actionDetailSidebarView');
		Session.set('selectedItemId', this.item._id);
	},

	'click': function() {		
		$(".message[data-messageid='" + this._id + "']").removeClass('new-message');
	}
});

Template.actionAttrChangeActivity.events({
	'click': function() {		
		$(".message[data-messageid='" + this._id + "']").removeClass('new-message');
	}
});

Template.messageHolder.helpers({
	archivedClass: function() {
		return this.archived?"archived":"";
	},

	messageTemplate: function() {
		var template;		
		switch(this.type) {
			case 'message': template = 'message'; break;
			case 'task': template = 'actionItem'; break;
			case 'bug': template = 'actionItem'; break;
			case 'activity': template = 'activityMessage'; break;			
			default: template = 'message'; break;
		}		
		console.log("Template for " + this.type + " is: " + template);
		return template;		
	}
});

Template.header.helpers({	
	messageFilterString: function() {
		return Session.get('messageFilterString');
	},

	messagesFilterActive: function() {
		var filterString = Session.get('filterString');
		return filterString == null || filterString.length == 0 ? 'active' : '';
	}
});

Template.header.events( {
	'keyup .message-filter-input': function(e) {
		OpenLoops.onMessageFilterInput();
	},
});

Template.filterItem.helpers({
	activeClass: function() {
		return Session.get('filterString') == this.query?'active':'';
	}
})

Template.filterItem.events({
	'click': function() {
		Session.set('currentFilter', this);
		Session.set('filterString', this.query);
	}
});

Template.listings.events({
	'submit .new-channel-form': function(e) {		
		e.stopPropagation();
		e.preventDefault(); 
		var name = $('.channel-input').val();
		if(name && name.length > 0) {
			$('.new-channel-form').hide();
			$(".channel-input").val('');
			Meteor.call('createChannel', {
				boardId: Session.get('currentBoardId'),
				name: name
			});
			Session.set('channel', name);
		}
		
	},
	'click .add-channel-button': function() {
		$('.new-channel-form').show();
		$('.channel-input').focus();
		$("#new-channel-overlay").fadeIn();		
	},

	'click #create-channel-button': function() {
		$('#createChannelDialog').modal({
			closable: true,
			blurring: true,
			onApprove : function() {
				var activeTab = $('#createChannelDialog .create-channel-tabs .active').attr('data-tab');
				debugger;
				if(activeTab === 'action-tab') {
					var actionTitle = $("#createChannelDialog input[name='action-title']").val();
					var actionDescription = $("#createChannelDialog textarea[name='action-description']").val();
					var actionType = $("#createChannelDialog input[type='radio']:checked").attr('data-type');
					if(actionTitle != null && actionTitle.length > 0) {
						OpenLoops.createAction(actionType, actionTitle);
					} else {
						return false;
					} 
				} else {
					var channelName = $("#createChannelDialog input[name='discussion-name']").val();
					if(channelName != null && channelName.length > 0) {
						Meteor.call('createChannel', {
							boardId: Session.get('currentBoardId'),
							name: channelName,
							type: 'discussion-channel'
						});
					} else {
						return false;
					} 
				}
			}
		});		
$('#createChannelDialog').modal('show');
}
});

Template.channel.helpers({
	active: function () {
		if (Session.get('channel') === this.name) {
			return "active";
		} else {
			return "";
		}
	}
});

Template.channel.events({
	'click': function() {		
		Session.set('messageLimit', 30);
		Session.set('filterString', '');
		Session.set('boardPage.viewTemplate', 'messageHistoryView');
		Router.go("/board/" + Session.get('currentBoardId') + "/channel/" + this.name + "/messages");
	}
});

