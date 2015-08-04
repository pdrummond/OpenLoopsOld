Meteor.methods({
  createFilter: function (filter) {
    filter.timestamp = Date.now();
    filter.userId = Meteor.userId();
    Filters.insert(filter);    
  },

  deleteFilter: function(filterId) {
    Filters.remove(filterId);
  }
})