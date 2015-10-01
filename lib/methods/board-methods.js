Meteor.methods({
  createBoard: function (board) {
    check(board, {
      title: String,
      description: Match.Optional(String)
    });
    board.createdAt = Date.now();
    board.createdBy = Meteor.userId();
    board.members = [{userId: Meteor.userId(), role:'ADMIN'}];    
    var boardId = Boards.insert(board);
  },

  updateBoard: function (board) {
    if(Meteor.isServer) {
      check(board, {
        _id: String,
        title: String,        
        description: Match.Optional(String),   
        createdAt: Match.Optional(Number),
        createdBy: Match.Optional(String),
        updatedAt: Match.Optional(Number),
        updatedBy: Match.Optional(String),
        members: Match.Optional([Match.Any])
      });      
      board.updatedAt = Date.now();
      board.updatedBy = Meteor.userId();
      Boards.update(board._id, {$set: board});
    }
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
    } else if(role == 'USER' && _.where(board.members, {role:'ADMIN'}).length == 1 && board.members[0].userId == memberUserId) {
      throw new Meteor.Error("member-update-failed-002", "Board must have at least one Admin");
    }
    Boards.update({
      _id: boardId, 
      'members.userId': memberUserId
    }, {
      $set: {
        "members.$.role": role      
      }
    });
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
  },

  removeBoardPrefixFields: function() {
    Boards.find().forEach(function(board) {
      Boards.update( {_id: board._id} , {$unset: { prefix : "" } } );
    });
  }
});