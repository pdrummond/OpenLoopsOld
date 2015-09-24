
Meteor.startup(function() {	
	Messages.find().observe({
		added:function(document) {
			var newMessageCount = Session.get('newMessageCount') || 0;
			Session.set('newMessageCount', ++newMessageCount);
			console.log("BOOM - new message added. " + Session.get('newMessageCount') + " newew Messages");
		}
	});
});
Template.newMessagesToast.helpers({
	newMessagesCount: function() {
		return Session.get('newMessageCount');
	},

	showToastClass: function() {
		return Session.get('newMessageCount') == 0 ? 'hide':'';
	}
});

Template.newMessagesToast.events({
	'click': function() {
		Session.set('newMessageCount', 0);		
		OpenLoops.scrollBottom();
	}
})