Meteor.startup(function() {
	Session.setDefault('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
});

Template.messages.onCreated(function() {
	var self = this;
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
		var template = this.template || "message";
		console.log('template:', template);
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
OpenLoops.MESSAGE_LIMIT_INC = 30;