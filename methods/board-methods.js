Meteor.methods({
  createBoard: function (board) {
    board.timestamp = Date.now();
    board.userId = Meteor.userId();
    var boardId = Boards.insert(board); 

    Meteor.call('createChannel', {boardId: boardId, name:"general"});
    Meteor.call('createChannel', {boardId: boardId, name:"random"});
  },

  deleteBoard: function(boardId) {
    Boards.remove(boardId);
  }
})