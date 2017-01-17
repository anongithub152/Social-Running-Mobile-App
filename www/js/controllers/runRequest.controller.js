angular.module('RUN')
  .controller('runRequestCtrl', function ($scope,$stateParams) {
    var vm = this;
    vm.runRequestObject={};
    vm.runRequestObject=$stateParams.scheduleType;
  });
