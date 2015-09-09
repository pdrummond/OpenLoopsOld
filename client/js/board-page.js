Template.boardPage.helpers({
	viewTemplate: function() {
		return Session.get('boardPage.viewTemplate') || 'messageHistoryView';
	}
});