
Meteor.startup(function() {
	Session.setDefault('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
	Session.setDefault('messageCreationType', "message");
	Session.setDefault('currentSection', "description");
});

Template.messages.onCreated(function() {
	var self = this;
	// map multiple combinations to the same callback   
	self.autorun(function() {
		self.subscribe('messages', {
			filter: OpenLoops.getFilter(Session.get('filterString')),
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
					title: title, 
					query: query,
					channel: Session.get('channel')
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
	
	filters: function() {
		return Filters.find({'channel': Session.get('channel')});
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

Template.listings.helpers({
	channels: function () {
		return Channels.find();
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
			Meteor.call('createChannel', {name: name});
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
		Router.go("/channel/" + this.name + "/messages");
	}
});

AbstractMessageComponent = BlazeComponent.extendComponent({
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
			Meteor.call('updateMessageStatus', Session.get('selectedMessage')._id, newStatus);
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
		return [{
			'click': this.onClick
		}];
	},
	
	onRendered: function() {
		this.$('.ui.dropdown').dropdown();
		$('.ui.sidebar').sidebar({
			dimPage: false,
		});
	},

	onClick: function() {
		//var selectedMessage = Session.get('selectedMessage');
		//$('.ui.sidebar').sidebar('toggle');
		//if(selectedMessage && selectedMessage._id == this.data()._id) {

		//}
		Router.go("/task/" + this.data()._id);
	}
}).register('MessageComponent');

TaskMessageComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'taskMessage';
	},

	hideMilestoneClass: function() {
		return this.data().milestone == null? 'hide':'';
	}

}).register('TaskMessageComponent');

MilestoneMessageComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'milestoneMessage';
	}

}).register('MilestoneMessageComponent');

ActivityComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'activityMessage';
	}

}).register('ActivityComponent');

Template.milestoneItem.events({
	'click': function() {
		Meteor.call('updateMessageMilestone', Session.get('selectedMessage')._id, this._id);
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

Template.taskDetailPage.helpers({
	isButtonActive: function(data) {
		return data.hash.buttonName == Session.get('currentSection')?'active':'';
	},

	isSectionActive: function(data) {
		return data.hash.section == Session.get('currentSection')?'block':'none';
	}
})

Template.taskDetailPage.events({
	'click #description-button': function() {
		Session.set("currentSection", 'description');
	},
	'click #comments-button': function() {
		Session.set("currentSection", 'comments');
	},
	'click #activity-button': function() {
		Session.set("currentSection", 'activity');
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

	scrollBottomAnimate: function() {
		$(".message-history").stop().animate({scrollTop:$('.message-history')[0].scrollHeight}, 500, 'swing');
	},

	createMessage: function(messageType, text) {
		messageType == messageType || 'message';
		Meteor.call('createMessage', {
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
