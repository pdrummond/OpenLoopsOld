Meteor.methods({
  createDiscussion: function (discussion, channel) {
    discussion.timestamp = Date.now();
    discussion.userId = Meteor.userId();    
    discussion.title = slugify(discussion.title);
    var discussionId = Discussions.insert(discussion);

    Meteor.call('createActivity', {
        activityType: 'create-discussion',
        discussion: Discussions.findOne(discussionId),
        boardId: discussion.boardId,        
        activityChannel: channel
      });    
  },
});