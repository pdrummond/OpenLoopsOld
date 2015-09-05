Template.messageListPage.helpers({
	viewTemplate: function() {
		return Session.get('messageListPage.viewTemplate') || 'channelMessagesView';
	}
});