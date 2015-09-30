Template.messageHistoryPage.helpers({
	viewTemplate: function() {
		return Session.get('messageHistoryPage.viewTemplate') || 'messageHistoryView';
	}
});

Template.messageHistoryView.onCreated(function() {
	var self = this;	
	self.autorun(function() {
		self.subscribe('messages', {
			showActivity: Session.get('messageHistory.showActivity'),
			filter: OpenLoops.getMessageFilter(Session.get('messageFilterString')),
			boardId: Session.get('currentBoardId'),
			limit: Session.get('messageLimit'),			
		}, function() {
			var messagesReceivedTimeStamp = new Date().getTime();			
			setTimeout(function() {
				OpenLoops.scrollBottom();					
				Messages.find().observe({
					added:function(message) {
						if(OpenLoops.atBottom == false && message.timestamp > messagesReceivedTimeStamp) {
							if(message.userId != Meteor.userId()) {
								console.log("NEW MESSAGE: " + JSON.stringify(message, null, 4));		
								var newMessageCount = Session.get('newMessageCount') || 0;
								Session.set('newMessageCount', ++newMessageCount);								
								$(".message[data-messageid='" + message._id + "']").addClass('new-message');
								console.log("newMessageCount: " + Session.get('newMessageCount'));
							}
						}
					}
				});
				OpenLoops.Notify.init();
				Notifications.find().observe({
					added:function(notification) {
						OpenLoops.Notify.show(notification);
					}
				});
			}, 50);
		});
});	
});

Template.messageHistoryView.helpers({
	messages: function() { 
		return Messages.find({}, {sort: {timestamp: 1}});
	},
});

Template.messageHistoryView.events({
	'click #show-earlier-link': function() {
		var newLimit = Session.get('messageLimit') + OpenLoops.MESSAGE_LIMIT_INC;
		Session.set('messageLimit', newLimit);
	}
});

Template.header.events({
	'click #channel-messages-button': function() {
		Session.set('boardPage.viewTemplate', 'messageHistoryView');
	},	

	'click #channel-members-button': function() {
		Session.set('boardPage.viewTemplate', 'channelMembersView');
	},

	'click #toggle-right-sidebar-button': function() {
		if($('#actions-wrapper').css('right') == '0px') {
			$('#actions-wrapper').css('right', '-500px');
			$('#toggle-right-sidebar-button i').removeClass('right').addClass('left');
			$('.app-header').css('right', 0);
			$('.main-wrapper').css('padding-right', '0px');
			$('.footer').css('right', '0px');
		} else {
			$('#actions-wrapper').css('right', '0px');
			$('#toggle-right-sidebar-button i').removeClass('left').addClass('right');
			$('.app-header').css('right', '500px');
			$('.main-wrapper').css('padding-right', '500px');
			$('.footer').css('right', '500px');
		}
	},

	'click #create-post-menu-item': function() {
		Session.set('createItemForm.type', 'post');
		Session.set('createItemForm.label', 'Post');
		OpenLoops.showCreateItemFormInSidebar();
	},

	'click #create-discussion-menu-item': function() {
		Session.set('createItemForm.type', 'discussion');
		Session.set('createItemForm.label', 'Discussion');
		OpenLoops.showCreateItemFormInSidebar();
	},

	'click #create-article-menu-item': function() {
		Session.set('createItemForm.type', 'article');
		Session.set('createItemForm.label', 'Article');
		OpenLoops.showCreateItemFormInSidebar();
	},

	'click #create-task-menu-item': function() {
		Session.set('createItemForm.type', 'task');
		Session.set('createItemForm.label', 'Task');
		OpenLoops.showCreateItemFormInSidebar();
	},

	'click #create-bug-menu-item': function() {
		Session.set('createItemForm.type', 'bug');
		Session.set('createItemForm.label', 'Bug');
		OpenLoops.showCreateItemFormInSidebar();
	},

	'click #create-todo-menu-item': function() {
		Session.set('createItemForm.type', 'todo');
		Session.set('createItemForm.label', 'Todo');
		OpenLoops.showCreateItemFormInSidebar();
	}
});

Template.header.helpers({
	isCircleButtonActive: function(templateName) {
		return Session.get('messageListPage.viewTemplate') == templateName ? 'active':'';
	}
});

Template.header.onRendered(function() {	
	this.$('.ui.dropdown').dropdown({on: 'hover'});	
});


Template.footer.onRendered(function() {	
	this.$('.ui.dropdown').dropdown();
	this.$("#show-activity-checkbox").checkbox().first().checkbox({
		onChecked: function() {
			Session.set('messageHistory.showActivity', true);
		},
		onUnchecked: function() {
			Session.set('messageHistory.showActivity', false);
		}
	});
});

Template.footer.helpers({
	messageCreationType: function() {
		return Session.get('messageCreationType') || "message";
	},

	subjectSuggestions: function() {
		var subjectText = Session.get('newSubjectText') || '';
		return Items.find({title: {'$regex':subjectText}});
        /*$and: [{
            $or: [{type: 'bug'}, {type:'task'}]}, {title: {$regex:subjectText}}]
        }, 
        {limit: 20, sort: {timestamp: -1}});*/

		//Session.get('subjectSuggestions');
	},

	newItemIcon: function() {
		return OpenLoops.getItemIcon({type:Session.get('newSubjectItemType')});
	},

	currentSubjectLabel: function() {
		var subjectItem = Items.findOne(Session.get('newSubjectItemId'));
		var subjectLabel = '';
		if(subjectItem) {
			subjectLabel = OpenLoops.getSidLabel(subjectItem) + " " + subjectItem.title;
		}
		$("#subject-input").val(subjectLabel);
	},

	showActivity: function() {
		return Session.get('messageHistory.showActivity');
	}
});

Template.footer.events({
	/*'click #show-activity-checkbox': function() {
		Session.set('messageHistory.showActivity', !Session.get('messageHistory.showActivity'));
		$("#show-activity-checkbox").checkbox(Session.get('messageHistory.showActivity')?'check':'uncheck');
	},*/

	'click #logout-menu-item': function() {
		Meteor.logout();
	},

	'click #create-box-message-menu-item': function() {
		Session.set('messageCreationType', 'message');
	},

	'click #create-box-task-menu-item': function() {
		Session.set('messageCreationType', 'task');
	},

	'click #create-box-milestone-menu-item': function() {
		Session.set('messageCreationType', 'milestone');
	},

	'keypress .input-box_text': function(e) {
		$("#subjectSuggestionPopup").fadeOut();
		Streamy.broadcast('user-is-typing', { userId: Meteor.userId() });

		var inputVal = $('.input-box_text').val();
		var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
		if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
			e.preventDefault();
			e.stopPropagation();
		} else {			
			if (charCode == 13 && e.shiftKey == false) {
				e.preventDefault();
				e.stopPropagation();
				if(inputVal.length > 0 && inputVal.indexOf('/') == 0) {
					var commandData = inputVal.match(/\/(\w+) (\w+) (.*)/);
					if(commandData && commandData.length == 4) {
						var command = commandData[1];
						var itemType = commandData[2];
						var commandContent = commandData[3];

						switch(command) {
							case 'create': {
								if(itemType == "task" || itemType == "todo" || itemType == "bug") {
									OpenLoops.createAction(itemType, commandContent, Session.get('newSubjectItemId'), function(error, result) {
										if(error) {
											alert("Error: " + error);
										}
									});
								}
								break;
							}
						}						
					}   
				} else {
					OpenLoops.createMessage(inputVal, Session.get('newSubjectItemId'));
				}
				$('.input-box_text').val("");
				return false;
			}    
		}
	},

	'click #full-screen-message-input': function() {
		Session.set('zenEditorContent', $('#message-input').val());
		Session.set('zenEditorTargetInput', '#message-input');
		$("#zenEditor").show();
	},

	'keyup #subject-input': function() {
		Session.set('newSubjectItemId', null);
		Session.set('newSubjectItemType', null);

		var subjectText = $("#subject-input").val();
		if(subjectText != null && subjectText.length > 0) {
			$("#subjectSuggestionPopup").fadeIn();
			Session.set('newSubjectText', subjectText);
			/*Meteor.subscribe('subjectSuggestions', {subjectText: subjectText}, function(error, result) {			
				if(!error) {
					Session.set('subjectSuggestions', result);
					if(result.length > 0) {
						$("#subjectSuggestionPopup").fadeIn();
					}
				}
			});*/
} else {			
	$("#subjectSuggestionPopup").fadeOut();
}	
},

	/*'click #new-item-icon': function() {		
		var type = Session.get('newItemType');
		switch(type) {
			case 'message': type = 'discussion'; break;
			case 'discussion': type = 'task'; break;
			case 'task': type = 'bug'; break;
			case 'bug': type = 'message'; break;
			default: type = 'message'; break;
		}
		Session.set('newItemType', type);
	}*/
});
