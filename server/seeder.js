Meteor.startup(function() {
  var debug = false;
  if(debug == true) {
    if(!Boards.findOne("loadtest")) {
      Boards.insert({
        '_id': 'loadtest',
        'title': 'Load Test Board',
        'prefix': 'LOD'
      });
      Meteor.call('createChannel', {boardId: 'loadtest', name:'general'});
      Meteor.call('createChannel', {boardId: 'loadtest', name:'random'});      
    }


    Factory.define('message', Messages, {
      boardId: 'loadtest', 
      text: function() {
        return Fake.sentence();
      },
      user: Fake.user({
        fields: ['name', 'username', 'emails.address', 'profile.name'],
      }),
      timestamp: Date.now(),
      channel: 'general',
      type: function() { return Fake.fromArray(['message', 'task', 'milestone'])},
      archived: function() { return Fake.fromArray([false, true]); },
      status: function() { return Fake.fromArray(['open', 'in-progress', 'blocked', 'in-test', 'done']); }

    });

    _(2000).times(function(n) {
      Factory.create('message');
    });
  }
});