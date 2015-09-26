
Meteor.methods({
  updatePodPrefix: function (podPrefix) {
    check(podPrefix, String);
    PodSettings.update('default', {$set: {podPrefix:podPrefix.toUpperCase()}});
  }
});