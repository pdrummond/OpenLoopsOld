
Template.boardList.helpers({
	noBoards: function() {
		return Boards.find().count() == 0;
	}
});

Template.boardList.events({	
	"click #save-pod-settings": function(e) {
		e.preventDefault();
		var input = $("#pod-prefix-input").val();
		if(input != null && input.length > 0) {
			Meteor.call('updatePodPrefix', input);
		}
	},
	"click #board-logout": function() {
		Meteor.logout();
	},

	"click #create-board-button": function() {
		$('#createBoardDialog').modal({
			closable: false,
			blurring: true,
			onVisible: function() {
				setTimeout(function() {
					$("#createBoardDialog input[name='title']").focus();
				}, 1);
			},
			onApprove : function() {
				var board = {
					title: $("#createBoardDialog input[name='title']").val(),
					prefix: $("#createBoardDialog input[name='prefix']").val(),
				};
				Meteor.call("createBoard", board, function(error, result) {
					if (error) {
						return alert(error.reason);
					}
				});
			}
		});
		$('#createBoardDialog').modal('show');
		
	},
});
