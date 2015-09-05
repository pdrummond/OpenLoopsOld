Meteor.startup(function() {
	Session.setDefault('messageListPage.viewTemplate', 'channelMessagesView');
});

Template.header.events({
	'click #channel-messages-button': function() {
		Session.set('messageListPage.viewTemplate', 'channelMessagesView');
	},
	
	'click #channel-description-button': function() {
		Session.set('messageListPage.viewTemplate', 'channelDescriptionView');
	},

	'click #channel-members-button': function() {
		Session.set('messageListPage.viewTemplate', 'channelMembersView');
	},

	'click #toggle-right-sidebar-button': function() {
		if($('#actions-wrapper').css('right') == '0px') {
			$('#actions-wrapper').css('right', '-500px');
			$('#toggle-right-sidebar-button i').removeClass('right').addClass('left');
			$('.app-header').css('right', 0);
			$('.main-wrapper').css('padding-right', '0px');
			$('.footer').css('right', '0px');
		} else {
			$('#actions-wrapper').css('right', '0px');
			$('#toggle-right-sidebar-button i').removeClass('left').addClass('right');
			$('.app-header').css('right', '500px');
			$('.main-wrapper').css('padding-right', '500px');
			$('.footer').css('right', '500px');
		}
	},
});

Template.header.helpers({
	isCircleButtonActive: function(templateName) {
		return Session.get('messageListPage.viewTemplate') == templateName ? 'active':'';
	}
});