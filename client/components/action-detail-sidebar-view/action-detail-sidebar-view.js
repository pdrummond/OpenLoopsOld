Template.actionDetailSidebarView.events({
	'click #full-screen-icon': function() {
		Router.go('/board/' + Session.get('currentBoard')._id + '/action/' + this._id + "/description");
		/*Session.set('messageLimit', 30);
		Session.set('filterString', '');
		Router.go("/board/" + Session.get('currentBoard')._id + "/channel/" + this.channel + "/messages");*/
	},

	'click #back-icon': function() {
		Session.set('rightSidebarTemplate', 'actions');
	},
	
	'click .status.item': function(e) {
		e.preventDefault();		
		var newStatus = $(e.target).attr('data-value');
		if(newStatus && newStatus.length > 0){
			Meteor.call('updateActionStatus', this._id, newStatus, Session.get('channel'));
		}
	}
});

Template.actionDetailSidebarView.onRendered(function() {
	this.$('.ui.accordion').accordion();
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});
});

Template.actionDetailSidebarView.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('actionDetailMessages', {			
			board: Session.get('currentBoard'),
			channel: Session.get('selectedAction').channel,
			limit: Session.get('messageLimit'),
		}, function() {
			//Do nothing here.
		});
	});	
});