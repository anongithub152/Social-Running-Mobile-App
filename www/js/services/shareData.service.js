angular.module('RUN')
	.factory('shareData', function() {
		var data = {};
		data.runReminder = 900000; //15mins before runReminder
		data.allowedRunDelay = 900000; //delay in run start
		return {
			getData: getData,
			setData: setData
		}
		function getData(key){
			return data[key];
		}
		function setData(key,val){
			data[key] = val;
		}
	});