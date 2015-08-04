Meteor.startup(function() {
	Session.setDefault('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
	Session.setDefault('messageCreationType', "message");
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
		}
		console.log("template:" + template);
		return template;		
	}
});

Template.header.events({
	'keyup .input-box_filter': function(e) {
		OpenLoops.onFilterInput(e);
	}
});

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Template.header.helpers({
	channelName: function() {
		return Session.get('channel');
	},

	filterString: function() {
		return Session.get('filterString');
	}
});

Template.registerHelper('profileImage', function (context) {
	if(context) {
		var userId = _.isObject(context) ? context._id : context;		
		return Meteor.users.findOne(userId).profileImage;
	}
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
		Router.go("/" + this.name);		
	}
});

MessageDetailComponent = BlazeComponent.extendComponent({

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
	},

	onRendered: function() {
		this.$('.ui.dropdown').dropdown();	
	},

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
	},

	milestones: function() {
		return Milestones.find({channel: Session.get('channel')});
	},

	milestoneLabel: function() {
		var milestone =  Milestones.findOne(this.data().milestone);
		return milestone?milestone.text:'';
	}

}).register('TaskMessageDetailComponent');

MilestoneMessageDetailComponent = MessageDetailComponent.extendComponent({
	
	template: function() {
		return 'messageDetail';
	}

}).register('MilestoneMessageDetailComponent');


MessageComponent = BlazeComponent.extendComponent({

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

	milestoneLabel: function() {
		var milestone =  Milestones.findOne(this.data().milestone);
		return milestone?milestone.text:'';
	},

	statusLabel: function() {
		return OpenLoops.TaskStatus[this.data().status || OpenLoops.DEFAULT_STATUS_VALUE].label;
	},

	statusColor: function() {
		return OpenLoops.TaskStatus[this.data().status || OpenLoops.DEFAULT_STATUS_VALUE].color;
	},

	onClick: function() {				
		Session.set('selectedMessage', this.data());
		$('.ui.sidebar').sidebar('toggle');
	}
}).register('MessageComponent');

TaskMessageComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'taskMessage';
	}

}).register('TaskMessageComponent');

MilestoneMessageComponent = MessageComponent.extendComponent({
	
	template: function() {
		return 'milestoneMessage';
	}

}).register('MilestoneMessageComponent');

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
	'click #create-box-message-menu-item': function() {
		Session.set('messageCreationType', 'message');
	},

	'click #create-box-task-menu-item': function() {
		Session.set('messageCreationType', 'task');
	},

	'click #create-box-milestone-menu-item': function() {
		Session.set('messageCreationType', 'milestone');
	},
});

Template.app.events({
	'click #close-sidebar-button': function() {
		$('.ui.sidebar').sidebar('toggle');
	}
});

Template.app.helpers({
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
			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
			filter[field] = value; 
			match = re.exec(filterString);			
		}
		if(remainingText && remainingText.length > 0) {
			filter["$or"] = [{title: {$regex:remainingText}}, {text: {$regex:remainingText}}];
		}			
		filter.channel = Session.get('channel');
		console.log("Current filter is: " + JSON.stringify(filter));
		return filter;
	},

	scrollBottom: function() {
		$('.message-history').scrollTop($('.message-history')[0].scrollHeight);
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
