var app = angular.module('mannApp', []);
app.controller('mainController', function($scope, $http) {
    var gv_update_flag = false;
	var gv_Object_id = '';
	
	var dateVar = new Date();
	
/*    var n = d.getMonth();*/
    $scope.full_months = ["January", "February", "March", "April", "May", "JUNE", "JULY", "August", "September", "October", "November", "December"];
	$scope.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    $scope.years = [2018,2019];
    $scope.MOP = ["Cash","Debit Card","Credit Card","Net Banking","e-Wallet"]; //MOP-Mode of Payment
    $scope.selectedMonth = $scope.months[dateVar.getMonth()];
    $scope.selectedYear = dateVar.getYear()+1900;
    $scope.selectedMOP = "Cash";
    $scope.showExpForm = false;
	$scope.month_total = 0;
    $("#expDate").val(dateVar.getDate()+"-"+((dateVar.getMonth()<9)?"0":"")+(dateVar.getMonth()+1)+"-"+dateVar.getFullYear());
    /*$http({
        method : "GET",
        url : "https://devilram.co/getExp"
    }).then(function mySuccess(response) {
        $scope.expenseData = response.data;
        console.log($scope.expenseData);
    }, function myError(response) {
        $scope.expenseData = response.statusText;
    });*/

    $http.get("https://devilram.co/getMonthWiseExpense/"+$scope.selectedMonth)
    .then(function(response) {
      $scope.expenseData = response.data;
      calcTotalOftheMonth(response.data);
    });

    $scope.submitExp = function(){
      var expense = {
        date 	: $('#expDate').val(),
        title 	: $('#expItem').val(),
        amount 	: $('#expAmount').val(),
        comments: $('#expComment').val(),
        mop 	: $scope.selectedMOP
      };
      //UPDATING THE LOCAL-JSON variable (used for updating the exp at server-side)
	  var local_exp_var = {
		  month		: $scope.full_months[parseInt(expense.date.split('-')[1])-1],
		  exp_date 	: expense.date,
		  exp_title : expense.title,
		  amount 	: expense.amount,
		  comment 	: expense.comments,
		  mop 		: expense.mop
	  };		  
		  
	  /*$scope.expenseData.push(local_exp_var);*/
	  console.log(expense.date+" "+expense.title+expense.amount+expense.comments+expense.mop);
	  
	  //resetting the values
      $('#expItem').val("");
      $('#expAmount').val("");
      $('#expComment').val("");
      
		if(expense.title == "" || expense.amount == ""){
			alert("Enter proper values for expense\nEither Title or Amount (or both) field is empty\nRecheck and Try Again!!");
		} else {
			if(gv_update_flag){			//UPDATE-OPERATION
				gv_update_flag = false;
				/*OBJECT ID BINDING...... REQUIRED FOR UPDATING*/
				var data_to_transfer = { id: gv_Object_id, exp: local_exp_var};
				console.log(data_to_transfer);
				$http({
					method: 'POST',
					crossDomain: true,
					url: "https://devilram.co/updateExpenseData",
					data: data_to_transfer,
					headers: {'Content-Type': 'application/json'}
				}).then(function (response) {
					console.log('returned: '+response.data);
					gv_Object_id = ''; //resetting the global variable(that stores the id of the data-set to be updated)
				});
			} else {					//INSERT-OPERATION
				$http({
					method: 'POST',
					crossDomain: true,
					url: "https://devilram.co/storeExpWebApp",
					data: expense,
					headers: {'Content-Type': 'application/json'}
				}).then(function (response) {
					console.log('returned: '+response.data);
				});
			}
			console.log('Re-loading the updated data');
			$scope.getMonthWiseExpense();	//calling the function to load the updated data
		}
    }

    $scope.deleteExp = function(exp_id){
      //alert("deleted exp with "+exp_id+" id");
      $http.get("https://devilram.co/deleteExpense/"+exp_id)
      .then(function(response) {
        console.log(response.data);
      });
    }

    $scope.getMonthWiseExpense = function(){
      console.log("selected month = "+$scope.selectedMonth);
      $http.get("https://devilram.co/getMonthWiseExpense/"+$scope.selectedMonth)
      .then(function(response) {
        if(Object.keys(response.data).length == 0){
          //$scope.expenseData = null;
          $scope.expenseData = [{
            month : $scope.selectedMonth,
            exp_date : "",
            exp_title : "NO DATA FOUND",
            amount : "00",
            comment : "Check and try again"
          }];
          console.log('No Data Found');
		  $scope.month_total = 0;
        } else{
          $scope.expenseData = response.data;
          //console.log($scope.expenseData);
		  calcTotalOftheMonth(response.data);
        }
      });
    };
	
	function calcTotalOftheMonth (expense_json){
		var lv_month_total = 0;
		var lv_month_CC_total = 0;
		  console.log('Max value: '+expense_json.length);
		  for(indx=0;indx< expense_json.length;indx++){
		  		if(expense_json[indx].mop != 'Credit Card'){
		  			lv_month_total = lv_month_total + parseInt(expense_json[indx].amount);
		  		}
		  		else {
		  			lv_month_CC_total = lv_month_CC_total + parseInt(expense_json[indx].amount);
		  		}
			  	
		  }
		  console.log("Monthly Total = "+lv_month_total);
		  console.log("Monthly CC Total = "+lv_month_CC_total);
		  $scope.month_total = lv_month_total;
	}
	
	$scope.updateExpense = function(exp_id){
		console.log("updating triggered");
		gv_update_flag = true;
		$scope.showExpForm=true;
		var selected_exp_data = $(this).parentsUntil("div").siblings().prevObject.prevObject[0].data;
		console.log(selected_exp_data);
		gv_Object_id = exp_id;
		console.log(exp_id);
		
		
		$('#expDate').val(selected_exp_data.exp_date);
        $('#expItem').val(selected_exp_data.exp_title);
        $('#expAmount').val(selected_exp_data.amount);
        $('#expComment').val(selected_exp_data.comment);
        $scope.selectedMOP = selected_exp_data.mop;
	}
	
	$scope.clearForm = function(){
		$('#expDate').val("");
		$('#expItem').val("");
		$('#expAmount').val("");
		$('#expComment').val("");
		gv_update_flag = false; //indicating form has been re-initiated to be a SUBMIT form
	}

});

//date-picker script
$( function() {
    $( "#expDate" ).datepicker({ dateFormat: 'dd-mm-yy' });
} );
