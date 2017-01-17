angular.module('RUN')

.controller('AppCtrl', function($scope, dbUtility, $timeout) {
  vm = this;
  var uid = firebase.auth().currentUser.uid;
  vm.notificationAlert = 0;
  var reqCode = dbUtility.getRequestCode();
  firebase.database().ref('/userNotifications/' + uid + '/' + reqCode['pending']).on('value', function (notSnp) {
    console.log('number=');
    console.log(notSnp.numChildren());
    $timeout(function(){
      vm.notificationAlert = notSnp.numChildren();
    })
  });  
});