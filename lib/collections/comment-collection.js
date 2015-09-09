Comments = new Mongo.Collection("comments");

if(Meteor.isServer) {
  Meteor.publish('comments', function(actionId) {
    return Comments.find({actionId: actionId});
  });
}

Meteor.methods({
  createComment: function (comment) {
    comment.timestamp = Date.now();
    comment.userId = Meteor.userId();

    var commentId = Comments.insert(comment);

    Meteor.call('createActivity', {
      activityType: 'create-comment',
      comment: Comments.findOne(commentId),
      action: Actions.findOne(comment.actionId),
      boardId: comment.boardId,
      description: " ",      
    });
  }
})