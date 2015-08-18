Meteor.methods({
  createComment: function (comment) {
    comment.timestamp = Date.now();
    comment.userId = Meteor.userId();    
    Comments.insert(comment);

    /*var activityMessage = 'Commented on task <strong>#OLZ-10</strong>';
      Meteor.call('createActivity', {
        boardId: comment.boardId, 
        text: activityMessage
      });*/ 
  }
})