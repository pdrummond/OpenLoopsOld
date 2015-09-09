Meteor.methods({
  convertMarkdown: function(desc ){
    check( desc, String );
    return parseMarkdown(desc);    
  }
});