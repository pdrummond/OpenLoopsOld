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

  updateLabel: function (label) {
    check(label, {
      _id: String,
      description: Match.Optional(String),
      color: Match.Optional(String),
      createdAt: Match.Optional(Number),
      createdBy: Match.Optional(String),
      updatedAt: Match.Optional(Number),
      updatedBy: Match.Optional(String)      
    });      
    label.updatedAt = Date.now();
    label.updatedBy = Meteor.userId();
    Labels.update(label._id, {$set: label});
  },

  deleteLabel: function(labelId) {
    check(labelId, String);
    Labels.remove(labelId);
  },
});