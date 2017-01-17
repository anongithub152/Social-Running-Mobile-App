angular.module('RUN')
  .controller('logDetailsCtrl', function ($scope,$stateParams) {
    var vm = this;
    vm.individualScheduleLog={};
    vm.individualScheduleLog=$stateParams.runlog;
    // vm.individualScheduleLog.timer=vm.individualScheduleLog.timer.slice(0, -3);
  });
