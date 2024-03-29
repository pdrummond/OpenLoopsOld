Meteor.methods({
  createLabel: function (label) {
    check(label, {
      _id: String,
      color: Match.Optional(String),
      description: Match.Optional(String)
    });
    label._id = slugify(label._id.toLowerCase());
    label.createdAt = Date.now();
    label.createdBy = Meteor.userId();    
    var labelId = Labels.insert(label);
  },

  updateLabel: function (id, label) {
    check(id, String);
    check(label, {      
      description: Match.Optional(String),
      color: Match.Optional(String),
      createdAt: Match.Optional(Number),
      createdBy: Match.Optional(String),
      updatedAt: Match.Optional(Number),
      updatedBy: Match.Optional(String)      
    });      
    label.updatedAt = Date.now();
    label.updatedBy = Meteor.userId();
    Labels.update(id, {$set: label});
  },

  deleteLabel: function(labelId) {

    Items.find({labels: labelId}).forEach(function(item) {
      Items.update(item._id, { $pull: {
        labels: labelId
      }});
    });

    check(labelId, String);
    Labels.remove(labelId);
  },
});