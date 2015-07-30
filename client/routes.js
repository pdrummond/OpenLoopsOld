Router.configure({
  layoutTemplate: 'app',
  waitOn: function() { 
    return [Meteor.subscribe('channels'), Meteor.subscribe('allUsernames')]
  }
});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
}

Router.route('/', function () {
    this.redirect('/general');
}, {name: 'channel'});

Router.route('/:channel', function () {
	Session.set('channel', this.params.channel);
    this.render('messages');
});


Router.onBeforeAction(requireLogin, {exclude: ['accessDenied']});