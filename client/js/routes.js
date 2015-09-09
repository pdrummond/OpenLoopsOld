Router.configure({
  layoutTemplate: 'app',
  notFoundTemplate: 'notFound',
  waitOn: function() { 
    return [
    Meteor.subscribe('boards'),
    Meteor.subscribe('boardMembers'),
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

Router.route('/board/:boardId/messages', function () {
  var board = Boards.findOne(this.params.boardId);
  if(!board) {
    this.render("notFound");
  } else {
    Meteor.subscribe('milestones', board._id);
    Session.set('currentBoard', board);
    this.render('boardPage');
  }
}, {name: 'boardPage'});

Router.route('/board/:boardId/action/:_id/:section', {
  name: 'actionDetailPage',
  waitOn: function() {
    return [
    Meteor.subscribe('milestones', this.params.boardId),
    Meteor.subscribe('singleAction', this.params._id),
    Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() {    
    var board = Boards.findOne(this.params.boardId);
    if(board) {
      Session.set('currentBoard', board);
      var action = Actions.findOne(this.params._id);    
      if(action != null) {
        Session.set('selectedAction', action);
        Session.set('currentSection', this.params.section);
        console.log("selectedAction: " + JSON.stringify(action, null, 4));
        return action;
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
  name: 'actionDetailCommentPage',
  template: 'actionDetailPage',
  waitOn: function() {
    return [
    Meteor.subscribe('milestones', this.params.boardId),
    Meteor.subscribe('singleAction', this.params._id),
    Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() {    
    var board = Boards.findOne(this.params.boardId);
    if(board) {
      Session.set('currentBoard', board);
      var action = Actions.findOne(this.params._id);    
      if(action != null) {
        Session.set('selectedAction', action);
        Session.set('currentSection', "comments");
        Session.set('selectedCommentId', this.params.commentId);
        return action;
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


Router.onBeforeAction(requireLogin, {only: ['boardList', 'boardPage', 'actionDetailPage', 'actionDetailCommentPage']});
//Router.onBeforeAction('dataNotFound', {only: ['boardPage', 'actionDetailPage', 'actionDetailCommentPage']});
