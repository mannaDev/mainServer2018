var app = angular.module('mannApp', []);
app.controller('mainController', function($scope, $http) {
    var dateVar = new Date();
/*    var n = d.getMonth();*/
    $scope.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    $scope.years = [2018,2019];
    $scope.selectedMonth = $scope.months[dateVar.getMonth()];
    $scope.selectedYear = dateVar.getYear()+1900;

    /*$http({
        method : "GET",
        url : "https://nanna.website/getExp"
    }).then(function mySuccess(response) {
        $scope.expenseData = response.data;
        console.log($scope.expenseData);
    }, function myError(response) {
        $scope.expenseData = response.statusText;
    });*/

    $http.get("https://nanna.website/getExp")
    .then(function(response) {
      $scope.expenseData = response.data;
      console.log($scope.expenseData);
    });
});
