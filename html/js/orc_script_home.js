window.onload = function(){
  $.get("https://devilram.co/getAllProjectTitles", function(rcvdData) {
		console.log('Loading Project Details...');
		console.log(rcvdData);

		/*var titlesObj = JSON.parse(rcvdData);*/
		var titlesObj = rcvdData;

		var parentElem = document.getElementById("titleListContainer");
			
			for(var index in titlesObj){
				var listItem = document.createElement("li");
				var title = titlesObj[index].title;
				
				listItem.innerHTML = title;
				listItem.className = "titleLists";

				parentElem.appendChild(listItem);
			}
	});
}


var month_arr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
var year_arr = [2018,2019];
var date_arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];

var saveData = function(p_data1){
	console.log(p_data1);
	$.get("https://devilram.co/servertest", function(data) {
		console.log('exec started');
		// Now use this data to update your view models,
		// and Knockout will update your UI automatically
		console.log(data);
	});
	var data_post = {name:"kaushal_manna_jd",age:24};
	$.post( "https://devilram.co/saveOrcJob", { data_post } )
		.done(function( data ) {
			console.log( "Data Loaded: " + data );
		});
		
	console.log('fn call ret 0');
}

var getAllTitles = function(){
	alert();
}