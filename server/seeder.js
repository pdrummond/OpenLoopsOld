Meteor.startup(function() {
  var debug = true;
  if(debug) {
    if (Channels.find({}).count() === 0) {
      Channels.remove({});
      Channels.insert({
        name: "general"
      });
      Channels.insert({
        name: "random"
      });
    }

    Factory.define('message', Messages, {
      text: function() {
        return Fake.sentence();
      },
      user: Fake.user({
        fields: ['name', 'username', 'emails.address', 'profile.name'],
      }),
      timestamp: Date.now(),
      channel: 'general',
      archived: function() { return Fake.fromArray([false, true]); },
      status: function() { return Fake.fromArray(['open', 'in-progress', 'blocked', 'in-test', 'done']); }

    });

    Messages.remove({});

    _(5000).times(function(n) {
      Factory.create('message');
    });

  }
});