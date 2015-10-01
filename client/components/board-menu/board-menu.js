
Template.boardMenu.onRendered(function() {
	this.$('#board-menu-dropdown').dropdown();
});

Template.boardMenu.events({
	'click #logout-menu-item': function() {
		Meteor.logout();
	},

	'click #show-all-boards': function() {
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
