Template.messageHistoryPage.helpers({
	viewTemplate: function() {
		return Session.get('messageHistoryPage.viewTemplate') || 'messageHistoryView';
	}
});

Template.messageHistoryView.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('messages', {
			filter: OpenLoops.getMessageFilter(Session.get('messageFilterString')),
			board: Session.get('currentBoard'),			
			limit: Session.get('messageLimit'),			
		}, function() {
			setTimeout(function() {
				if(Session.get('messageLimit') == OpenLoops.MESSAGE_LIMIT_INC) {
					OpenLoops.scrollBottom();					
				}				
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
});

Template.header.helpers({
	isCircleButtonActive: function(templateName) {
		return Session.get('messageListPage.viewTemplate') == templateName ? 'active':'';
	}
});

Template.footer.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
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
	}
});

Template.footer.events({
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
		var inputVal = $('.input-box_text').val();		
		if(!!inputVal) {
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if (charCode == 13) {
				e.stopPropagation();
				if(inputVal.indexOf('/') == 0) {
					var commandData = inputVal.match(/\/(\w+) (\w+) (.*)/);
					if(commandData && commandData.length == 4) {
						var command = commandData[1];
						var itemType = commandData[2];
						var commandContent = commandData[3];

						switch(command) {
							case 'create': {
								if(itemType == "milestone") {
									OpenLoops.createMilestone(commandContent, function(error, result) {
										if(error) {
											alert("Error: " + error);
										}
									});	
								} else {
									OpenLoops.createAction(itemType, commandContent, Session.get('newSubjectItemId'), function(error, result) {
										if(error) {
											alert("Error: " + error);
										}
									});
								}
								break;
							}
						}
						console.log("command:" + JSON.stringify(commandData));
					}   
				} else {
					OpenLoops.createMessage(inputVal, Session.get('newSubjectItemId'));
				}
				$('.input-box_text').val("");
				return false;
			}    
		}
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
