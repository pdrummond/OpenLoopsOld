Meteor.methods({
  createBoard: function (board) {
    check(board, {
      title: String,
      prefix: String      
    });
    board.createdAt = Date.now();
    board.createdBy = Meteor.userId();
    board.members = [{userId: Meteor.userId(), role:'ADMIN'}];
    if(Boards.find({prefix: board.prefix}).count() > 0) {
      throw new Meteor.Error('prefix-exists', 'A Board with this prefix already exists');
    }
    var boardId = Boards.insert(board);
  },

  updateBoard: function (board) {
    check(board, {
      _id: String,
      title: String,
      prefix: String,      
      createdAt: Number,
      createdBy: String,
      members: [String],
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
  },

  createBoardMember: function (boardMember) {
    check(boardMember, {
      userId: String,
      boardId: String,
      role: String
    });
    boardMember.createdAt = Date.now();
    boardMember.createdBy = Meteor.userId();
    if(Boards.find({boardId: boardMember.boardId, 'members.userId':boardMember.userId}).count() > 0) {
      throw new Meteor.Error('board-member-exists', 'User is already a member of this board');
    }
    Boards.update(boardMember.boardId, {$push: {
      members: {
        userId: boardMember.userId,
        role: boardMember.role
      }
    }});
  },

  updateBoardMemberRole: function(boardId, memberUserId, role) {
    check(boardId, String);
    check(memberUserId, String);
    var board = Boards.findOne(boardId);
    var currentUser = _.findWhere(board.members, {userId: Meteor.userId()}); 
    var boardMember = _.findWhere(board.members, {userId: memberUserId});
    if(currentUser.role != 'ADMIN') {
      throw new Meteor.Error("member-update-failed-001", "Only Admins can update members");
    } else if(boardMember.role == 'ADMIN' && role == 'USER' && Boards.find({boardId: boardId, 'members.role': 'ADMIN'}).count() <= 1) {
      throw new Meteor.Error("member-update-failed-002", "Board must have at least one Admin");
    }
    Boards.update(boardId, {$set: {
      "members.$": {
        userId: memberUserId,
        role: role
      }
    }});
  },

  deleteBoardMember: function(boardId, memberUserId) {
    check(boardId, String);
    check(memberUserId, String);
    var board = Boards.findOne(boardId);
    var currentUser = _.findWhere(board.members, {userId: Meteor.userId()}); 
    var boardMember = _.findWhere(board.members, {userId: memberUserId});
    if(currentUser.role != 'ADMIN') {
      throw new Meteor.Error("member-delete-failed-001", "Only Admins can remove members");
    } else if(boardMember.role == 'ADMIN' && Boards.find({boardId: boardId, 'members.role': 'ADMIN'}).count() <= 1) {
      throw new Meteor.Error("member-delete-failed-002", "Board must have at least one Admin");
    }
    Boards.update(boardId, {$pull: {
      members: {
        userId: memberUserId        
      }
    }});
  }
});