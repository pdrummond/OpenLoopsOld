
Template.actionItem.onRendered(function() {

	this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});
});

Template.actionItem.helpers({
	milestoneLabel: function() {
		var milestone =  Milestones.findOne(this.milestone);
		return milestone?milestone.title:'No Milestone';
	},	
});

Template.actionItem.events({
	'click .action .header': function() {		
		OpenLoops.showItemDetailInSidebar(this._id);
	},

	'mouseover .action.item .action-check': function(e) {
		$(e.target).removeClass('square outline').addClass('checkmark box');
	},

	'mouseout .action.item .action-check': function(e) {
		$(e.target).removeClass('checkmark box').addClass('square outline');
	}
});
