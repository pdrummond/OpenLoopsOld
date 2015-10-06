Router.configure({
  layoutTemplate: 'app',
  notFoundTemplate: 'notFound',
  waitOn: function() { 
    return [
    Meteor.subscribe('podSettings'),
    Meteor.subscribe('teamMembers'),
    Meteor.subscribe('boards'),
    Meteor.subscribe('labels'),
    Meteor.subscribe('filters'),
    Meteor.subscribe('allUsernames'),
    Meteor.subscribe('notifications'),
    Meteor.subscribe('userPresence')
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
  this.render('missionControl');
}, {name: 'missionControl'});

Router.route('/board/:boardId/messages', function () {
  console.log("BOOM: messages routes invoked");
  var board = Boards.findOne(this.params.boardId);
  if(!board) {
    this.render("notFound");
  } else {
    //Meteor.subscribe('subjectSuggestions', {boardId: this.params.boardId, subjectText: ''});
    Meteor.subscribe('milestones', board._id);
    Meteor.subscribe('actions', {
      filter: OpenLoops.getActionFilter(Session.get('actionFilterString')),
      boardId: this.params.boardId,
      limit: Session.get('actionLimit')
    });
    Session.set('currentBoardId', this.params.boardId);
    this.render('messageHistoryPage');
  }
}, {name: 'messageHistoryPage'});

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


Router.onBeforeAction(requireLogin, {only: ['missionControl', 'messageHistoryPage', 'actionDetailPage', 'actionDetailCommentPage']});
//Router.onBeforeAction('dataNotFound', {only: ['messageHistoryPage', 'actionDetailPage', 'actionDetailCommentPage']});

