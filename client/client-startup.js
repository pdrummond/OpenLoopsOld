Meteor.startup(function() {
	Session.setDefault('messageHistory.showActivity', true);
	Session.setDefault('messagesReceivedTimeStamp', new Date().getTime());
	Session.setDefault('newMessageCount', 0);
	Session.setDefault('messageHistoryPage.viewTemplate', 'messageHistoryView');
	Session.setDefault('newItemType', 'message');
	Session.setDefault('activeActionTab', 'actions');
	Session.setDefault('actionLimit', 30);
	Session.setDefault('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
	Session.setDefault('commentLimit', OpenLoops.COMMENT_LIMIT_INC);
	Session.setDefault('messageCreationType', "message");
	Session.setDefault('currentSection', "description");	
});