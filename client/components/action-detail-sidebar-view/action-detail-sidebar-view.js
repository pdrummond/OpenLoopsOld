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
	},

	'keyup #comment-input': function(e) {
		e.stopPropagation();
		e.preventDefault();
		var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
		if (charCode == 13) {			
			var inputVal = $("#comment-input").val();
			if(inputVal != null && inputVal.length > 0) {				
				OpenLoops.createMessage(inputVal, this._id);
				$("#comment-input").val('');
			}	
		}
	}
});

Template.actionDetailMessages.helpers({
	actionMessages: function() {		
		return Messages.find({subjectItemId: this._id}, {sort: {timestamp: 1}});
	}
});

Template.actionDetailSidebarView.onRendered(function() {
	$('.menu .item').tab();
	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});
});

Template.actionDetailSidebarView.onCreated(function() {
	var self = this;
	self.autorun(function() {
		self.subscribe('itemMessages', {			
			board: Session.get('currentBoard'),
			subjectItemId: this._id,			
			limit: Session.get('messageLimit'),
		}, function() {
			//Do nothing here.
		});
	});	
});