
Template.actionItem.onRendered(function() {

	/*this.$('.ui.dropdown').dropdown({
		action: 'hide'
	});*/
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


function monitorTiltDirection(item) {
	var left_pos = item.position().left,
	move_handler = function (e) {
		if (e.pageX >= left_pos) {
			item.addClass("right");
			item.removeClass("left");
		} else {
			item.addClass("left");
			item.removeClass("right");
		}
		left_pos = e.pageX;
	};
	$("html").bind("mousemove", move_handler);
	item.data("move_handler", move_handler);
}