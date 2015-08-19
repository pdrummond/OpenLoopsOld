
Meteor.startup(function() {
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

Template.comments.events({
	'click #comment-reply-form-submit': function() {
		var text = $("#comment-reply-textarea").val();
		if(text && text.length > 0) {
			Meteor.call('createComment', {
				boardId: Session.get('currentBoard')._id,
				messageId: Session.get('selectedMessage')._id, 
				text: text
			});
		}
	}
});

Template.comments.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('comments', {			
			messageId: Session.get('selectedMessage')._id,
			//limit: Session.get('commentLimit'), 
		}, function() {			
		});
	});
});

Template.messages.onCreated(function() {
	var self = this;
	// map multiple combinations to the same callback   
	self.autorun(function() {
		self.subscribe('messages', {
			filter: OpenLoops.getFilter(Session.get('filterString')),
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
		var template = this.template || "MessageComponent";
		switch(this.type) {
			case 'task': template = 'TaskMessageComponent'; break;
			case 'milestone': template = 'MilestoneMessageComponent'; break;
			case 'activity': template = 'ActivityComponent'; break;
		}
		console.log("template:" + template);
		return template;		
	}
});

Template.header.events({
	'keyup .input-box_filter': function(e) {
		OpenLoops.onFilterInput(e);
	},

	'click #create-filter-button': function() {
		var title = prompt("Tab Name");
		if(title != null) {
			var query = $(".input-box_filter").val();
			if(query != null && query.length > 0) {
				Meteor.call('createFilter', {
					boardId: Session.get('currentBoard')._id,
					channel: Session.get('channel'),
					title: title, 
					query: query					
				});
			}
		}
	},

	'click #messages-filter-item': function() {
		Session.set('filterString', null);
	},

	'click #delete-filter-button': function() {
		var filter = Session.get('currentFilter');
		if(filter != null) {
			Meteor.call('deleteFilter', filter._id);
		}
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

Template.registerHelper('boards', function (context) {
	return Boards.find();
});

Template.registerHelper('currentBoardId', function (context) {
	return Session.get('currentBoard')._id;
});


Template.registerHelper('channels', function (context) {
	return Channels.find({boardId: Session.get('currentBoard')._id});
});

Template.registerHelper('filters', function (context) {
	return Filters.find({
		boardId: Session.get('currentBoard')._id, 
		channel: Session.get('channel')
	});
});

Template.registerHelper('comments', function (context) {
	return Comments.find({messageId: Session.get('selectedMessage')._id});
});

Template.registerHelper('currentBoardTitle', function (context) {
	return Session.get('currentBoard').title;
});

Template.registerHelper('profileImage', function (context) {
	if(context) {
		var userId = _.isObject(context) ? context._id : context;		
		return Meteor.users.findOne(userId).profileImage;
	}
});

Template.registerHelper('milestones', function() {
	return Milestones.find();
});

Template.registerHelper('currentChannel', function () {
	return Session.get('channel');
});

Template.registerHelper("timestampToTime", function (timestamp) {
	var date = new Date(timestamp);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
});

Template.registerHelper("truncateCommentText", function (obj, text, maxSize) {	
	if(text.length > maxSize) {
		return parseMarkdown(text.substring(0, maxSize)).replace(/^<p>/, '').replace(/<\/p>$/,'') + 
		"... (<a href='/board/" + 
			Session.get('currentBoard')._id + "/task/" + obj.task._id + 
			"/comments/" + obj.comment._id + "'> Read More </a>)";	
	} else {
		return parseMarkdown(text).replace(/^<p>/, '').replace(/<\/p>$/,'');
	}
});

Template.registerHelper("currentUserName", function () {
	var user = Meteor.user();
	if(user != null) {
		return user.username;
	}
});

Template.registerHelper("usernameFromId", function (userId) {
	var user = Meteor.users.findOne({_id: userId});
	if (typeof user === "undefined") {
		return "Anonymous";
	}
	if (typeof user.services.github !== "undefined") {
		return user.services.github.username;
	}
	return user.username;
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

AbstractMessageComponent = BlazeComponent.extendComponent({
	
	events: function() {
		return [{	
			'click .task-link': this.onTaskLinkClicked
		}]
	},

	onRendered: function() {
		this.$('.ui.dropdown').dropdown();	
	},

	milestoneLabel: function() {
		var milestone =  Milestones.findOne(this.data().milestone);
		return milestone?milestone.title:'No Milestone';
	},

	statusLabel: function() {
		if(this.data().status != null) {
			return OpenLoops.TaskStatus[this.data().status].label || 'No Status';
		} else {
			return '';
		}
	},

	statusColor: function() {
		if(this.data().status != null) {
			return OpenLoops.TaskStatus[this.data().status].color || '';
		} else {
			return '';
		}
	},	
});

MessageDetailComponent = AbstractMessageComponent.extendComponent({

	template: function() {
		return 'messageDetail';
	},

	events: function() {		
		return [{
			'click #edit-button': this.onEditButtonClicked,
			'click #save-button': this.onSaveButtonClicked,
			'click #cancel-button': this.onCancelButtonClicked,
		}]
	},

	onEditButtonClicked: function() {
		this.$("#message-text").hide();
		this.$("#message-text-input").show();
		this.$("#message-text-input").focus();
		this.$("#edit-button").hide();
		this.$("#edit-text-buttons").show();
	},

	onCancelButtonClicked: function() {
		this.$("#message-text").show();
		this.$("#message-text-input").hide();
		this.$("#edit-button").show();
		this.$("#edit-text-buttons").hide();
	},

	onSaveButtonClicked: function() {
		var newText = this.$("#message-text-input").val();

		this.$("#message-text").show();
		this.$("#message-text-input").hide();
		this.$("#edit-button").show();
		this.$("#edit-text-buttons").hide();

		Meteor.call('updateMessageText', Session.get('selectedMessage')._id, newText);		
	}

}).register('MessageDetailComponent');

TaskMessageDetailComponent = MessageDetailComponent.extendComponent({
	
	template: function() {
		return 'taskMessageDetail';
	},


	events: function() {
		return TaskMessageDetailComponent.__super__.events.call(this).concat({
			'click .status.item': this.onStatusClicked,
		});    
	},

	onStatusClicked: function(e) {
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateMessageStatus', Session.get('selectedMessage')._id, newStatus, Session.get('channel'));
		}
	}	

}).register('TaskMessageDetailComponent');

MilestoneMessageDetailComponent = MessageDetailComponent.extendComponent({
	
	template: function() {
		return 'messageDetail';
	}

}).register('MilestoneMessageDetailComponent');


MessageComponent = AbstractMessageComponent.extendComponent({

	template: function() {
		return 'message';
	},
	
	events: function() {		
		return MessageComponent.__super__.events.call(this).concat({
			'click .header': this.onHeaderClick
		});
	},
	
	onRendered: function() {
		this.$('.ui.dropdown').dropdown();
		$('.ui.sidebar').sidebar({
			dimPage: false,
		});
	},

	onHeaderClick: function() {
		//var selectedMessage = Session.get('selectedMessage');
		//$('.ui.sidebar').sidebar('toggle');
		//if(selectedMessage && selectedMessage._id == this.data()._id) {

		//}
		Router.go('/board/' + Session.get('currentBoard')._id + '/task/' + this.data()._id + "/description");
	}
}).register('MessageComponent');

TaskMessageComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'taskMessage';
	},

	events: function() {
		return TaskMessageComponent.__super__.events.call(this).concat({
			'click .status.item': this.onStatusClicked,
			'click .milestone.item': this.onMilestoneClicked,
		});    
	},

	hideMilestoneClass: function() {
		return this.data().milestone == null? 'hide':'';
	},

	onStatusClicked: function(e) {
		e.preventDefault();
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateMessageStatus', this.data()._id, newStatus, Session.get('channel'));
		}
	},

	onMilestoneClicked: function(e) {
		e.preventDefault();
		var newMilestoneId = $(e.target).attr('data-value');		
		Meteor.call('updateMessageMilestoneId', this.data()._id, newMilestoneId, Session.get('channel'));
	},

}).register('TaskMessageComponent');

MilestoneMessageComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'milestoneMessage';
	}

}).register('MilestoneMessageComponent');

ActivityComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'activityMessage';
	},

	activityTemplate: function() {		
		console.log("activityTemplate = " + this.data().activityTemplate);
		return this.data().activityTemplate;
	},

	activityChannel: function() {
		return this.data().activityChannel;
	},

	taskChannel: function() {
		return this.data().task.channel;
	},

	taskId: function() {
		return this.data().task._id;
	},

	taskTitle: function() {
		return this.data().task.text;
	},

	taskOldMilestoneTitle: function() {
		return this.data().taskOldMilestoneTitle;
	},

	taskNewMilestoneTitle: function() {
		return this.data().taskNewMilestoneTitle;
	},

	taskOldStatus: function() {
		return this.data().taskOldStatus;
	},

	taskNewStatus: function() {
		return this.data().taskNewStatus;
	},

	taskUid: function() {
		return Boards.findOne(this.data().task.boardId).prefix + "-" + this.data().task.uid;
	},

	milestoneTitle: function() {
		return this.data().milestone.title;
	},

	milestoneId: function() {
		return this.data().milestone._id;
	},

	commentText: function() {		
		return this.data().comment.text;
	}

}).register('ActivityComponent');

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
	}
});

Template.board.events({
	'click': function() {		
		Session.set('currentBoard', this);
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
										} else {
										//??
									}
								});	
								} else {
									OpenLoops.createMessage(itemType, commandContent, function(error, result) {
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

Template.taskDetailPage.onCreated(function() {
	setTimeout(function() {
		var selectedCommentId = Session.get('selectedCommentId');
		if(selectedCommentId != null) {
			OpenLoops.scrollToElement('#comments-section', '#' + selectedCommentId);
		}
	}, 50);
});

Template.taskDetailPage.onRendered(function() {
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});	
});

Template.taskDetailPage.helpers({
	isButtonActive: function(data) {
		return data.hash.buttonName == Session.get('currentSection')?'active':'';
	},

	isSectionActive: function(data) {
		return data.hash.section == Session.get('currentSection')?'block':'none';
	}
})

Template.taskDetailPage.events({
	'click .task.message .header': function() {
		var channel = Session.get('channel') || "general";
		Router.go('/board/' + Session.get('currentBoard')._id + "/channel/" + channel + "/messages");
	},

	'click #description-button': function() {
		Router.go("/board/" + Session.get('currentBoard')._id + "/task/" + Session.get('selectedMessage')._id + "/description");
	},
	'click #comments-button': function() {
		Router.go("/board/" + Session.get('currentBoard')._id + "/task/" + Session.get('selectedMessage')._id + "/comments");
	},
	'click #activity-button': function() {
		Router.go("/board/" + Session.get('currentBoard')._id + "/task/" + Session.get('selectedMessage')._id + "/activity");
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
		Meteor.call('updateMessageMilestoneId', Session.get('selectedMessage')._id, this._id, Session.get('channel'));
	}
})

Template.editor.onRendered( function() {
	Meteor.promise( "convertMarkdown", this.data.description).then( function( html ) {
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
				return Meteor.promise( "updateTaskDescription", self._id, text);
			})
			.catch( function( error ) {
				Bert.alert( error.reason, "danger" );
			});
		}
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
