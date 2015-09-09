
Template.boardList.events({	
	"click #create-board-button": function() {
		$('#createBoardDialog').modal({
			closable: false,
			blurring: true,
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
