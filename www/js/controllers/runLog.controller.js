angular.module('RUN')
  .controller('runLogCtrl', function ($scope, $stateParams, dbUtility, $timeout) {
    var vm = this;
    vm.runningLogs = [];
    var runLogArr = [];
    var uid = firebase.auth().currentUser.uid;
    firebase.database().ref('/runningLog/' + uid).once('value',function (runLogs) {
      var runLogsList = runLogs.val();
      runLogArr = [];
      for(var key in runLogsList){
        runLogArr.push(runLogsList[key]);
      }
      $timeout(function () {
        vm.runningLogs = runLogArr;
      });
    });
  });
