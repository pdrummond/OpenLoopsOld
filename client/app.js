
Meteor.startup(function() {
	Session.setDefault('actionLimit', 30);
	Session.setDefault('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
	Session.setDefault('commentLimit', OpenLoops.COMMENT_LIMIT_INC);
	Session.setDefault('messageCreationType', "message");
	Session.setDefault('currentSection', "description");
});


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


Template.messages.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('messages', {			
			board: Session.get('currentBoard'),
			channel: Session.get('channel'),
			limit: Session.get('messageLimit'),			
		}, function() {
			setTimeout(function() {
				if(Session.get('messageLimit') == OpenLoops.MESSAGE_LIMIT_INC) {
					OpenLoops.scrollBottom();					
				}				
			}, 1);
		});
	});	
});

Template.messages.onRendered(function() {
	console.log("messages.onRendered()");
	Mousetrap.bind(['mod+m'], function() {
		var type = Session.get("messageCreationType");
		if(type === "message") {
			type = "task";
		} else if(type == "task") {
			type = "milestone";
		} else if(type == "milestone") {
			type = "message";
		}
		console.log("changing to " + type);
		Session.set("messageCreationType", type);
		return false;
	});
	$(".message-history").scroll(function() {		
		/*if($(".message-history").scrollTop() < 500) {
			console.log("checkScroll: " + $(".message-history").scrollTop());
			var newLimit = Session.get('messageLimit') + OpenLoops.MESSAGE_LIMIT_INC;
			Session.set('messageLimit', newLimit);
			window.scrollBy(500, 0);
		}*/

		/*if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			alert(bottom);
		}*/
	});
});

Template.messages.helpers({
	messages: function() {  	
		return Messages.find({}, {sort: {timestamp: 1}});
	},

	noMessages: function() {		
		return Messages.find({template: {$ne: 'welcomeMessage'}}, {sort: {timestamp: 1}}).count() == 0;
	},

	welcomeMessageNotPresent: function() {
		var count = Messages.find({template: 'welcomeMessage'}).count();
		return count == 0;
	}
});

Template.messages.events({
	'click #show-earlier-link': function() {
		var newLimit = Session.get('messageLimit') + OpenLoops.MESSAGE_LIMIT_INC;
		Session.set('messageLimit', newLimit);
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
			case 'activity': template = 'activityMessage'; break;			
			default: template = 'message'; break;
		}		
		return template;		
	}
});


Template.channelName.helpers({
	channelName: function() {
		return Session.get('channel');
	},
});

Template.header.helpers({	
	filterString: function() {
		return Session.get('filterString');
	},

	messagesFilterActive: function() {
		var filterString = Session.get('filterString');
		return filterString == null || filterString.length == 0 ? 'active' : '';
	}
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
				boardId: Session.get('currentBoard')._id,
				name: name
			});
			Session.set('channel', name);
		}
	},
	'click .add-channel-button': function() {
		$('.new-channel-form').show();
		$('.channel-input').focus();
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
		Router.go("/board/" + Session.get('currentBoard')._id + "/channel/" + this.name + "/messages");
	}
});

Template.actions.onRendered(function() {
	this.$('.ui.dropdown').dropdown({
		action:'hide'
	});
});

Template.milestoneItem.events({
	'click': function() {
		Meteor.call('updateMessageMilestoneId', Session.get('selectedMessage')._id, this._id, Session.get('channel'));
	}
});

Template.boardList.events({	
	"click #create-board-button": function() {
		$('#createBoardDialog').modal({
			closable: false,
			blurring: true,
			onApprove : function() {
				var board = {
					title: $("#createBoardDialog input[name='title']").val(),
					prefix: $("#createBoardDialog input[name='prefix']").val(),
				};
				Meteor.call("createBoard", board, function(error, result) {
					if (error) {
						return alert(error.reason);
					}
				});
			}
		});
		$('#createBoardDialog').modal('show');
	},
});

Template.boardMenu.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.boardMenu.events({
	'click #show-all-boards': function() {
		Router.go("/");
	},

	'click #board-settings': function() {		
		var board = Session.get('currentBoard');
		$('#boardSettingsDialog').modal({
			closable: true,
			blurring: true,
			onApprove : function() {
				board = _.extend(board, {					
					title: $("#boardSettingsDialog input[name='title']").val(),
					prefix: $("#boardSettingsDialog input[name='prefix']").val(),
				});
				Meteor.call("updateBoard", board, function(error, result) {
					if (error) {
						return alert(error.reason);
					}
				});
			}
		});		
		$("#boardSettingsDialog input[name='title']").val(board.title);
		$("#boardSettingsDialog input[name='prefix']").val(board.prefix);
		$('#boardSettingsDialog').modal('show');
	}
});

Template.board.events({
	'click': function() {		
		Session.set('currentBoard', this);
		Session.set('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
		Router.go("/board/" + Session.get('currentBoard')._id + "/channel/general/messages");
	}
});

Template.footer.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.footer.helpers({
	messageCreationType: function() {
		return Session.get('messageCreationType') || "message";
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

	'keypress input': function(e) {
		var inputVal = $('.input-box_text').val();
		if(!!inputVal) {
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if (charCode == 13) {
				e.stopPropagation();
				if(inputVal.startsWith('/')) {
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
									OpenLoops.createAction(itemType, commandContent, function(error, result) {
										if(error) {
											alert("Error: " + error);
										} else {
										//??
									}
								});
								}
								break;
							}
						}
						console.log("command:" + JSON.stringify(commandData));
					}          
				} else {
					OpenLoops.createMessage('message', inputVal);
				}
				$('.input-box_text').val("");
				return false;
			}    
		}
	}
});

Template.messageListPage.events({
	'click #close-sidebar-button': function() {
		$('.ui.sidebar').sidebar('toggle');
	}
});

Template.messageListPage.helpers({
	messageDetailTemplate: function() {
		var template = this.template || "MessageDetailComponent";
		switch(this.type) {
			case 'task': template = 'TaskMessageDetailComponent'; break;
			case 'milestone': template = 'MilestoneMessageDetailComponent'; break;
		}
		return template;
	},

	selectedMessage: function() {	
		return Session.get('selectedMessage');
	}
});



Template.boardSettingsDialog.onRendered(function() {
	this.$('.menu .item').tab();
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});	
});

Template.boardSettingsDialog.helpers({
	boardMembers: function() {
		return BoardMembers.find({boardId: Session.get('currentBoard')._id});
	}
});

Template.boardMember.onRendered(function() {
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});	
});

Template.boardMember.events({
	'click #new-member-button': function() {
		var memberName = prompt("Board Member Name:");		
		if(memberName != null && memberName.length > 0) {
			var user = Meteor.users.findOne({username: memberName});
			if(user == null) {
				alert("No user found with that name.  Please try again"); 
			} else {
				Meteor.call('createBoardMember', {
					boardId: Session.get('currentBoard')._id,
					userId: user._id,
					role: 'USER'
				}, function(error, result) {
					if(error) {
						alert("Error: " + error);
					}
				});
			}
		}
	},

	'click #set-admin-user': function() {
		Meteor.call('updateBoardMemberRole', this._id, "ADMIN", function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #set-normal-user': function() {
		Meteor.call('updateBoardMemberRole', this._id, "USER", function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #remove-member-button': function() {		
		Meteor.call('deleteBoardMember', this._id, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	}
});

Template.boardMember.helpers({
	roleName: function() {
		return this.role === 'ADMIN'?'Admin':'User';
	},

	roleIcon: function() {
		return this.role === 'ADMIN'?'spy':'user';
	}	
});

OpenLoops = {

	onFilterInput: function() {
		var self = this;
		if(this.keyTimer) {
			clearTimeout(this.keyTimer);
		}
		this.keyTimer = setTimeout(function() {
			Session.set("filterString", $(".input-box_filter").val());
		}, 1000);
	},

	getFilter: function(filterString) {
		var filter = {};		
		var remainingText = filterString;
		var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
		var match = re.exec(filterString);
		while (match != null) {	   
			var field = match[1].trim();
			var value = match[2].trim();
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			if(field == "milestone") {
				//if the filter is milestone:sprint1 then we need to convert this to the milestone:<milestoneId>				
				var milestones = Milestones.find({title:value}).fetch();
				if(milestones.length > 0) {
					value = milestones[0]._id;
				}
			}			
			filter[field] = value; 
			match = re.exec(filterString);			
		}
		if(remainingText && remainingText.length > 0) {
			filter["$or"] = [{title: {$regex:remainingText}}, {text: {$regex:remainingText}}];
		}
		//filter.channel = Session.get('channel');		
		console.log("Current filter is: " + JSON.stringify(filter));
		return filter;
	},

	scrollBottom: function() {
		$('.message-history').scrollTop($('.message-history')[0].scrollHeight);
	},

	scrollToElement: function(wrapperEl, el) {
		$('html, body').animate({
			scrollTop: $(el).offset().top
		}, 200);
	},

	scrollBottomAnimate: function() {
		$(".message-history").stop().animate({scrollTop:$('.message-history')[0].scrollHeight}, 500, 'swing');
	},

	createMessage: function(messageType, text) {
		messageType == messageType || 'message';
		Meteor.call('createMessage', {
			boardId: Session.get('currentBoard')._id,
			channel: Session.get('channel'),
			type: messageType,
			text: text,  
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			} else {
				OpenLoops.scrollBottomAnimate();
			}
		});
	},

	createAction: function(actionType, text) {
		actionType == actionType || 'task';
		Meteor.call('createAction', {
			boardId: Session.get('currentBoard')._id,
			channel: Session.get('channel'),
			type: actionType,
			title: text 
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	createMilestone: function(title, callback) {
		Meteor.call('createMilestone', {
			boardId: Session.get('currentBoard')._id,			
			title: title, 
		}, callback);
	}
}

OpenLoops.TaskStatus = {
	'new': {label: 'New', color: 'teal'},
	'open': {label: 'Open', color: 'green'},
	'in-progress': {label: 'In Progress', color: 'purple'},
	'blocker': {label: 'Blocker', color: 'red'},
	'in-test': {label: 'In-Test', color: 'yellow'},
	'done': {label: 'Done', color: 'blue'}
}

OpenLoops.DEFAULT_STATUS_VALUE = "new";
OpenLoops.MESSAGE_LIMIT_INC = 30;
OpenLoops.COMMENT_LIMIT_INC = 50;
