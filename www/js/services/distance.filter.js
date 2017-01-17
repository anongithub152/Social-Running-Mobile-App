angular.module('RUN')
.filter('mtrToMile',function(){
    return function(input){
        return (parseFloat(input)*0.00062137).toFixed(2);
    }
})