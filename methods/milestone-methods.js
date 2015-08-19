Meteor.methods({
  createMilestone: function (milestone) {
    milestone.timestamp = Date.now();
    milestone.userId = Meteor.userId();    
    milestone.title = slugify(milestone.title);
    var milestoneId = Milestones.insert(milestone);

    Meteor.call('createActivity', {
        action: 'create-milestone',
        milestone: Milesones.findOne('milestoneId'),
        boardId: message.boardId,        
        timestamp: message.timestamp
      });    
  },
});