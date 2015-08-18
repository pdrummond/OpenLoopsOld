Router.configure({
  layoutTemplate: 'app',
  notFoundTemplate: 'notFound',
  waitOn: function() { 
    return [
    Meteor.subscribe('boards'),
    Meteor.subscribe('channels'),
    Meteor.subscribe('milestones'),
    Meteor.subscribe('filters'),
    Meteor.subscribe('allUsernames')
  ]
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
  this.render('boardList');
}, {name: 'boardList'});

Router.route('/board/:boardId/channel/:channel/messages', function () {
  var board = Boards.findOne(this.params.boardId);
  Session.set('currentBoard', board);
	Session.set('channel', this.params.channel);
  this.render('messageListPage');
}, {name: 'messageListPage'});

Router.route('/task/:_id', {
  name: 'taskDetailPage',
  waitOn: function() {
    Meteor.subscribe('singleMessage', this.params._id);
  },
  data: function() {  
    var message = Messages.findOne(this.params._id);    
    return message;
  }
});

AccountsTemplates.configureRoute('signIn', {name: 'signIn', path:'sign-in'});
AccountsTemplates.configureRoute('signUp', {name: 'signUp', path:'sign-up'});

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "email",
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid email',
  },
  pwd
]);


Router.onBeforeAction(requireLogin, {only: ['boardList', 'messageListPage', 'taskDetail']});