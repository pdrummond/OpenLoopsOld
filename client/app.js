Meteor.startup(function() {
	Session.setDefault('activeActionTab', 'actions');
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
		//$('.new-channel-form').show();
		//$('.channel-input').focus();
		//$("#new-channel-overlay").fadeIn();		
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
							boardId: Session.get('currentBoard')._id,
							name: channelName,
							type: 'discussion-channel'
						});
					} else {
						return false;
					} 
				}
			}
		});		
		//$("#boardSettingsDialog input[name='title']").val(board.title);
		//$("#boardSettingsDialog input[name='prefix']").val(board.prefix);
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
		Session.set('messageListPage.viewTemplate', 'channelMessagesView');
		Router.go("/board/" + Session.get('currentBoard')._id + "/channel/" + this.name + "/messages");
	}
});

Template.actions.onRendered(function() {
	this.$('.ui.dropdown').dropdown({
		action:'hide'
	});
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