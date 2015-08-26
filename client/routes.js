Router.configure({
  layoutTemplate: 'app',
  notFoundTemplate: 'notFound',
  waitOn: function() { 
    return [
    Meteor.subscribe('boards'),
    Meteor.subscribe('boardMembers'),
    Meteor.subscribe('channels'),
    Meteor.subscribe('milestones'),
    Meteor.subscribe('filters'),
    Meteor.subscribe('allUsernames')
    ];
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
  if(!board) {
    this.render("notFound");
  } else {
    Session.set('currentBoard', board);
    Session.set('channel', this.params.channel);
    this.render('messageListPage');
  }
}, {name: 'messageListPage'});

Router.route('/board/:boardId/action/:_id/:section', {
  name: 'taskDetailPage',
  waitOn: function() {
    return [
    Meteor.subscribe('singleAction', this.params._id),
    Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() {    
    var board = Boards.findOne(this.params.boardId);
    if(board) {
      Session.set('currentBoard', board);
      var message = Messages.findOne(this.params._id);    
      if(message != null) {
        Session.set('selectedMessage', message);
        Session.set('currentSection', this.params.section);
        return message;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
});

//TODO: Figure out way to merge this with above
Router.route('/board/:boardId/action/:_id/comments/:commentId', {
  name: 'taskDetailCommentPage',
  template: 'taskDetailPage',
  waitOn: function() {
    return [
    Meteor.subscribe('singleMessage', this.params._id),
    Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() {    
    var board = Boards.findOne(this.params.boardId);
    if(board) {
      Session.set('currentBoard', board);
      var message = Messages.findOne(this.params._id);    
      if(message != null) {
        Session.set('selectedMessage', message);
        Session.set('currentSection', "comments");
        Session.set('selectedCommentId', this.params.commentId);
        return message;
      } else {
        return null;
      }
    } else {
      return null;
    }
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


Router.onBeforeAction(requireLogin, {only: ['boardList', 'messageListPage', 'taskDetailPage', 'taskDetailCommentPage']});
Router.onBeforeAction('dataNotFound', {only: ['messageListPage', 'taskDetailPage', 'taskDetailCommentPage']});