BoardMembers = new Mongo.Collection("board-members");

if(Meteor.isServer) {
  Meteor.publish('boardMembers', function() {
    return BoardMembers.find();
  });
}

Meteor.methods({

  createBoardMember: function (boardMember) {
    check(boardMember, {
      userId: String,
      boardId: String,
      role: String
    });
    boardMember.createdAt = Date.now();
    boardMember.createdBy = Meteor.userId();
    if(BoardMembers.find({userId:boardMember.userId, boardId: boardMember.boardId}).count() > 0) {
      throw new Meteor.Error('board-member-exists', 'User is already a member of this board');
    }
    var boardMemberId = BoardMembers.insert(boardMember);
    return boardMemberId;
  },

  updateBoardMemberRole: function(boardMemberId, role) {
    check(boardMemberId, String);
    check(role, String);

    var boardMember = BoardMembers.findOne(boardMemberId);

    if(boardMember.role == 'ADMIN' && BoardMembers.find({role: 'ADMIN'}).count() == 1) {
      throw new Meteor.Error("member-update-failed", "Board must have at least one admin member");
    }

    BoardMembers.update(boardMemberId, {$set: {role: role}});
  },

  deleteBoardMember: function(boardMemberId) {
    check(boardMemberId, String);

    var boardMember = BoardMembers.findOne(boardMemberId);

    if(boardMember.role == 'ADMIN' && BoardMembers.find({role: 'ADMIN'}).count() == 1) {
      throw new Meteor.Error("member-delete-failed", "Board must have at least one admin member");
    }

    BoardMembers.remove(boardMemberId);
  }

});