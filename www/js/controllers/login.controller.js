angular.module('RUN')
	.controller('LoginCtrl', function($scope) {
		var vm = this;
		$scope.user = {
			type:'existing'
		};
	});