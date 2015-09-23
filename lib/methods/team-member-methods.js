Meteor.methods({
  createTeamMember: function (teamMember) {
    check(teamMember, {
      _id: String,
      role: String      
    });

    var currentUserMember = TeamMembers.findOne(Meteor.user().emails[0].address);
    if(currentUserMember.role != 'ADMIN') {
      throw new Meteor.Error('create-team-member-failed-001', 'Only Admins can add team members');
    }

    teamMember.createdAt = Date.now();
    teamMember.createdBy = Meteor.userId();

    TeamMembers.insert(teamMember);
  },

  updateTeamMember: function (teamMember) {
    check(teamMember, {
      _id: String,
      role: String,
      createdAt: Match.Optional(Number),
      createdBy: Match.Optional(String),
      updatedAt: Match.Optional(Number),
      updatedBy: Match.Optional(String),      
    });

    var currentUserMember = TeamMembers.findOne(Meteor.user().emails[0].address);
    if(currentUserMember.role != 'ADMIN') {
      throw new Meteor.Error('update-team-member-failed-001', 'Only Admins can change team member details');
    }
    if(teamMember.role == 'USER' && TeamMembers.find({role: 'ADMIN'}).count() == 1 && TeamMembers.findOne({role: 'ADMIN'})._id == teamMember._id) {
     throw new Meteor.Error('update-team-member-failed-002', 'There must be at least one Admin team member'); 
    }
    teamMember.updatedAt = Date.now();
    teamMember.updatedBy = Meteor.userId();
    TeamMembers.update(teamMember._id, {$set: teamMember});
  },

  deleteTeamMember: function(teamMemberId) {
    check(teamMemberId, String);
    var currentUserMember = TeamMembers.findOne(Meteor.user().emails[0].address);
    if(currentUserMember.role != 'ADMIN') {
      throw new Meteor.Error('delete-team-member-failed-001', 'Only Admins can remove team members');
    }
    TeamMembers.remove(teamMemberId);
  }
});