Messages = new Mongo.Collection("messages");
Milestones = new Mongo.Collection("milestones");
Items = new Mongo.Collection("items");
BoardMembers = new Mongo.Collection("board-members");
Boards = new Mongo.Collection("boards");
Channels = new Mongo.Collection("channels");
Comments = new Mongo.Collection("comments");
Filters = new Mongo.Collection("filters");

if(Meteor.isServer) {
  Counters = new Mongo.Collection('counters');
}
