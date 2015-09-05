Template.channelMessagesView.onCreated(function() {
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
			}, 50);
		});
	});	
});

Template.channelMessagesView.onRendered(function() {
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

Template.channelMessagesView.helpers({
	messages: function() {  	
		return Messages.find({channel: Session.get('channel')}, {sort: {timestamp: 1}});
	},

	noMessages: function() {		
		return Messages.find({template: {$ne: 'welcomeMessage'}}, {sort: {timestamp: 1}}).count() == 0;
	},

	welcomeMessageNotPresent: function() {
		var count = Messages.find({template: 'welcomeMessage'}).count();
		return count == 0;
	}
});

Template.channelMessagesView.events({
	'click #show-earlier-link': function() {
		var newLimit = Session.get('messageLimit') + OpenLoops.MESSAGE_LIMIT_INC;
		Session.set('messageLimit', newLimit);
	}
});
