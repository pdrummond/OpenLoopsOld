Meteor.methods({
  updateTaskDescription:function(taskId, newDescription) {
  	Messages.update(taskId, {$set: {description: newDescription}});
  },
});
