
Template.boardList.helpers({
	noBoards: function() {
		return Boards.find().count() == 0;
	}
});

Template.boardList.events({	
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
					description: $("#createBoardDialog textarea[name='description']").val(),
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

Template.boardListItem.events({ 
	'click': function() {
		Router.go("/board/" + this._id + "/messages");
	}
})