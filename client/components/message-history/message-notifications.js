
Meteor.startup(function() {	
	
	Meteor.setInterval(function() {
		console.log("checking new message toast");
		
		updateToastVisibility();
	}, 2000);
});

Template.messageHistoryView.onRendered(function() {

	$(".message-history").scroll(function() {		
		OpenLoops.atBottom = (($(".message-history").scrollTop() + $(".message-history").height()) == $(".message-history")[0].scrollHeight);
		updateToastVisibility();
	});

});

Template.newMessagesToast.helpers({
	newMessagesCount: function() {
		return Session.get('newMessageCount');
	},	
});

Template.newMessagesToast.events({
	'click': function() {
		Session.set('newMessageCount', 0);		
		OpenLoops.scrollBottom();
	}
})

function updateToastVisibility() {
	if(Session.get('newMessageCount') > 0 && OpenLoops.atBottom == false) {
		$("#newMessagesToast").fadeIn();
	} else {
		$("#newMessagesToast").fadeOut();
		Session.set('newMessageCount', 0);
	}
}