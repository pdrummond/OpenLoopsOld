
Template.boardMenu.onRendered(function() {
	this.$('#board-menu-dropdown').dropdown();
});

Template.boardMenu.events({
	'click #logout-menu-item': function() {
		Meteor.logout();
	},

	'click #mission-control-menu-item': function() {
		Router.go("/");
	},

	'click #board-settings': function() {		
		var board = Boards.findOne(Session.get('currentBoardId'));
		$('#boardSettingsDialog').modal({
			closable: true,
			blurring: true,
			onApprove : function() {
				board = _.extend(board, {					
					title: $("#boardSettingsDialog input[name='title']").val(),
					description: $("#boardSettingsDialog textarea[name='description']").val(),
					statusSlots: getStatusSlots()
				});
				Meteor.call("updateBoard", board, function(error, result) {
					if (error) {
						return alert(error.reason);
					}
				});
			}
		});		
		$("#boardSettingsDialog input[name='title']").val(board.title);
		$("#boardSettingsDialog textarea[name='description']").val(board.description);
		$('#boardSettingsDialog').modal('show');
	}
});

Template.board.events({
	'click': function() {		
		Session.set('currentBoardId', this._id);
		Session.set('messageLimit', OpenLoops.MESSAGE_LIMIT_INC);
		OpenLoops.showActionListTabInSidebar();
		Router.go("/board/" + Session.get('currentBoardId') + "/messages");
	}
});


function getStatusSlots() {
	var slots = [];
	$("#status-slot-list .status-slot-item").each(function(el) {		
		var label = $(this).find("input[name='label']").val();
		var value = $(this).find("input[name='value']").val();
		var color = $(this).find(".color-dropdown .text .label").attr('data-color');

		if(label != null && label.length > 0 && value != null && value.length > 0) {
			slots.push({
				label: label,
				value: value,
				color: color
			});
		}
	});
	return slots;
}