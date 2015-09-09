
Template.messageHistoryView.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('items', {
			filter: OpenLoops.getMessageFilter(Session.get('messageFilterString')),
			board: Session.get('currentBoard'),			
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

Template.messageHistoryView.helpers({
	messages: function() {  	
		return Items.find({}, {sort: {timestamp: 1}});
	},
});

Template.messageHistoryView.events({
	'click #show-earlier-link': function() {
		var newLimit = Session.get('messageLimit') + OpenLoops.MESSAGE_LIMIT_INC;
		Session.set('messageLimit', newLimit);
	}
});
