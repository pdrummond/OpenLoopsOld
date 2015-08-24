Meteor.methods({
  createBoard: function (board) {
    check(board, {
      title: String,
      prefix: String      
    });
    board.createdAt = Date.now();
    board.createdBy = Meteor.userId();
    if(Boards.find({prefix: board.prefix}).count() > 0) {
      throw new Meteor.Error('prefix-exists', 'A Board with this prefix already exists');
    }
    var boardId = Boards.insert(board); 

    Meteor.call('createChannel', {boardId: boardId, name:"general"});
    Meteor.call('createChannel', {boardId: boardId, name:"random"});
    Meteor.call('createBoardMember', {boardId: boardId, userId:Meteor.userId(), role: 'ADMIN'});
  },

  updateBoard: function (board) {
    check(board, {
      _id: String,
      title: String,
      prefix: String,      
      createdAt: Number,
      createdBy: String,
      createdAt: Match.Optional(Number),
      createdBy: Match.Optional(String),
      updatedAt: Match.Optional(Number),
      updatedBy: Match.Optional(String),
      members: Match.Optional([String])
    });
    var boardDb = Boards.findOne(board._id);
    //if board prefix has changed and the new prefix already exists, then don't update the board.
    if(boardDb.prefix != board.prefix && Boards.find({prefix: board.prefix}).count() > 0) {
      throw new Meteor.Error('prefix-exists', 'A Board with this prefix already exists');
    }
    board.updatedAt = Date.now();
    board.updatedBy = Meteor.userId();
    Boards.update(board._id, {$set: board});
  },

  deleteBoard: function(boardId) {
    Boards.remove(boardId);
  }
})