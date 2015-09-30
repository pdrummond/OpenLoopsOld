
Meteor.startup(function() {	
	
	Meteor.setInterval(function() {
		updateToastVisibility();
	}, 2000);	

	// Attach an handler for a specific message
	Streamy.on('user-is-typing', function(d, s) {
		var user = Meteor.users.findOne(d.userId);
		if(user._id != Meteor.userId()) {		
  			$("#active-user-item[data-active-user-id='" + d.userId + "'] .is-typing").show();
  		}

  	});

  	Meteor.setInterval(function() {
		$("#active-user-item .is-typing").fadeOut();
  	}, 3000);
});

Template.messageHistoryView.onRendered(function() {

	$(".message-history").scroll(function() {
		OpenLoops.atBottom = (($(".message-history").scrollTop() + $(".message-history").height()) >= ($(".message-history")[0].scrollHeight-30));
		//console.log("one: " + (($(".message-history").scrollTop() + $(".message-history").height())));
		//console.log("two: " + $(".message-history")[0].scrollHeight);
		//console.log('AT BOTTOM: ' + OpenLoops.atBottom);
		updateToastVisibility();
	});

});

Template.newMessagesToast.helpers({
	newMessagesCount: function() {
		return Session.get('newMessageCount');
	},	
	
	atLeastOneNewMessage: function() {
		return Session.get('newMessageCount') > 0;
	},
	
	oneNewMessage: function() {
		return Session.get('newMessageCount') == 1;
	}
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
	}
}