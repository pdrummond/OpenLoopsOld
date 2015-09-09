Milestones = new Mongo.Collection("milestones");

if(Meteor.isServer) {
  Meteor.publish('milestones', function (boardId) {    
    return Milestones.find({boardId: boardId});
  });
}

Meteor.methods({
  createMilestone: function (milestone, channel) {
    milestone.timestamp = Date.now();
    milestone.userId = Meteor.userId();    
    milestone.title = slugify(milestone.title);
    var milestoneId = Milestones.insert(milestone);

    Meteor.call('createActivity', {
      activityType: 'create-milestone',
      milestone: Milestones.findOne(milestoneId),
      boardId: milestone.boardId,        
        timestamp: milestone.timestamp-1, //To ensure activity appears in message history before milestone
        activityChannel: channel
      });    
  },
});