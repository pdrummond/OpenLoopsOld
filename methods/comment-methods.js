Meteor.methods({
  createComment: function (comment) {
    comment.timestamp = Date.now();
    comment.userId = Meteor.userId();

    var commentId = Comments.insert(comment);

    Meteor.call('createActivity', {
      action: 'create-comment',
      comment: Comments.findOne(commentId),
      task: Messages.findOne(comment.messageId),
      boardId: comment.boardId,
      description: " ",
      timestamp: comment.timestamp -1 //To ensure activity appears in message history before comment
    });
  }
})