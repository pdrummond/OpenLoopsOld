Meteor.methods({
  createMilestone: function (milestone) {
    milestone.timestamp = Date.now();
    milestone.userId = Meteor.userId();    
    milestone.title = slugify(milestone.title);
    var milestoneId = Milestones.insert(milestone);

    var activityMessage = 'Created a new milestone called <strong>' + milestone.title + '</strong>';
    Meteor.call('createActivity', {text: activityMessage});

  },
});