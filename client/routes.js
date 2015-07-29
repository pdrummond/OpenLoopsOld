Router.configure({
  layoutTemplate: 'app',
  waitOn: function() { 
    return [Meteor.subscribe('channels'), Meteor.subscribe('allUsernames')]
  }
});

Router.route('/', function () {
    this.redirect('/general');
});

Router.route('/:channel', function () {
	Session.set('channel', this.params.channel);
    this.render('messages');
});