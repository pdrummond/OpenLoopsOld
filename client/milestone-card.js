Template.milestoneCard.events({
	'click .milestone .header': function() {
		Session.set('filterString', 'milestone:' + this.title);
		Session.set('activeActionTab', 'actions');
	}
});