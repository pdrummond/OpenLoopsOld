Meteor.methods({
  createMilestone: function (milestone) {
    milestone.timestamp = Date.now();
    milestone.userId = Meteor.userId();    
    milestone.title = slugify(milestone.title);
    var milestoneId = Milestones.insert(milestone);

    Meteor.call('createActivity', {
        action: 'create-milestone',
        milestone: Milestones.findOne(milestoneId),
        boardId: milestone.boardId,        
        timestamp: milestone.timestamp-1, //To ensure activity appears in message history before milestone
      });    
  },
});