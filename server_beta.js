/*----------------------------------------------|
	Server Specs:								|
	A. Methods									|
		i. 	Store Data in DB					|
		ii.	Extract Data from DB				|
		iii.Delete Data from DB					|
	B. App-related APIs							|
		1. Expense App 							|
		2. Work Tracking App					|
	C. BACK-UP Task								|
		*Read data from each collection from the|
		 available DBs and store them separately|
		 in files								|
-----------------------------------------------*/


/*	-------------- Importing the Required modules --------------  */
var express = require('express');
var url = require('url');
var path = require("path");
var mongodb = require('mongodb');
var fs = require('fs');
//var qs = require('querystring');

/*----------------------- Module variable Declaration Section ----------------------*/
var userCredentials;
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
/*-----------------------------------------------------------------------------------*/

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/*-----------------------------------------------------------------------------------*/

/*--------------------------------   GLOBAL VARIABLES  --------------------------------*/
//MongoDB variables
var MongoClient = mongodb.MongoClient;
var mongo_url = 'mongodb://localhost:27017/sars';
var databaseName="sars";
//month-variable array
var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var trimmedMonthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var concatMonth = "JanFebMarAprMayJunJulAugSepOctNovDec";
//DB Operation vars
var gv_inserted_flag;				//flag var to return the STATUS of the insert operation. TRUE = INSERTED and FALSE = Insertion Failed
/*-----------------------------------------------------------------------------------*/


var updateConfigDatabase = function(myquery, newvalues){
	MongoClient.connect(mongo_url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(databaseName);
		dbo.collection("user_config").updateOne(myquery, newvalues, function(err, res) {
			if (err) {
				console.log("error occured");
				throw err;
			}
			console.log(res.result.nModified+" document updated successfully"); //to indicate the number of records updated
			db.close();
		});
	});
}

/*-------------------------------------- --- Loading the pre-requisite essential Files --- --------------------------------------*/
//--------------------- Generalised code for loading CSS files ---------------------//
app.get('/css/:cssFile',function(req, res){
    res.sendFile(__dirname+"/html/css/"+req.params.cssFile);
});
//--------------------- Generalised codefor loading JS files ---------------------//
app.get('/js/:jsFile',function(req, res){
    res.sendFile(__dirname+"/html/js/"+req.params.jsFile);
});
//--------------------- Generalised Code for loading the images -----------------------//
app.get('/asset/images/:imageName',function(req, res){
    res.sendFile(__dirname+"/html/asset/images/"+req.params.imageName);
});
app.get('/asset/fonts/:fontName',function(req,res){
	res.sendFile(__dirname+"/html/asset/fonts/"+req.params.fontName);
});
/*-----------------------------------------------------------------------------------*/

/*-------------------------------------- --- Pages Loading --- --------------------------------------*/
app.get('/',function(req, res){
    res.sendFile(__dirname+"/html/home.html");
});
app.get('/home.htm*',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
});
app.get('/expenseHome',function(req, res){
	res.sendFile(__dirname+"/html/expense_index.html");
});
app.get('/oracleWork',function(req, res){
  res.sendFile(__dirname+"/html/orc_home.html");
});
/*--------------------------------------------------------------------------------------------------*/

/*-------------------------------- Generalised DB Operation Methods --------------------------------*/
//Method to Insert data inside the given database and return TRUE/FALSE
var insertIntoDB = function(dbname, collectionName, newvalues){
	gv_inserted_flag = false;
	MongoClient.connect(mongo_url, function(err, db) {
		if (err) {
			console.log('Unable to connect to mongo');
			console.log('CONNECTION FAILED');
			throw err;
		}
		var dbo = db.db(dbname);
		dbo.collection(collectionName).insertOne(newvalues, function(err, res) {
			if (err) {
				console.log('Unable to INSERT data.');
				console.log('INSERTION TASK FAILED');
				throw err;
			}
			console.log("1 document inserted");
			gv_inserted_flag = true;
			db.close();
		});
	});
};

//Method to fetch specified amount of data and return as a JSON object
var extractFromDB = function(p_db_name,p_collection_name,p_query){
	return new Promise(function(resolve,reject){
		MongoClient.connect(mongo_url, function(err, db) {
			var dbo = db.db(p_db_name);
			if (err) throw err;
			dbo.collection(p_collection_name).find(p_query).toArray(function(err, result) {
				if (err) throw err;
				if(result.length){
					//var tempdata = JSON.stringify(result);
					console.log("EXTRACTION SUCCESS; No of records retrieved : "+result.length);
					//res.send(JSON.stringify(result));
					resolve(result);
				}
				else{
					console.log("EXTRACTION FAILED");
					//res.send({});
					reject("not_found");
				}
			});
			db.close();
		});
	});
};

//Method to search for a specified entry in the DB and return TRUE/FALSE
var searchIntoDB = function(p_db_name,p_collection_name,p_query){
	return new Promise(function(resolve,reject){
		MongoClient.connect(mongo_url, function(err, db) {
			var dbo = db.db(p_db_name);
			if (err) {
				reject("err_occurred while connecting to mongod URL");
				throw err;
			}
			dbo.collection(p_collection_name).find(p_query).toArray(function(err, result) {
				if (err) {
					reject("err_occurred while searching for entry");
					throw err;
				}
				if (result.length){
					console.log("Data Found; No of records retrieved : "+result.length);
					resolve(1);
				}
				else{
					console.log("DATA NOT FOUND");
					reject("Data Not Found");
				}
			});
			db.close();
		});
	});
};

//Method to Delete a particular Entry from the DB and return TRUE/FALSE
var deleteFromDB = function(p_db_name,p_collection_name,p_query){
	return new Promise(function(resolve,reject){
		MongoClient.connect(mongo_url,function(err, db){
			var dbo = db.db(p_db_name);
			if (err) throw err;
			dbo.collection(p_collection_name).remove(p_query,function(err, obj){
				if(err) {
					reject("err_deleting_data");
					throw err;
				}
				console.log(obj.result.n + " document(s) deleted");
				resolve(obj.result.n + " document(s) deleted");
			});
			db.close();
		});
	});
};

var updateDB = function(p_db_name,p_collection_name,p_query,p_new_data){
	return new Promise(function(resolve,reject){
		MongoClient.connect(mongo_url,function(err, db){
			var db_database = db.db(p_db_name);
			if(err) throw err;
			//p_new_data = {$set:{amount:45.67}};
			console.log('Updating with following data: p_new_data');
			console.log(p_new_data);
			var lv_new_data = {$set: p_new_data};
			db_database.collection(p_collection_name).updateOne(p_query, lv_new_data, function(err, res) {
				if (err) {
					reject("err_updating_data");
					throw err;
				}
				console.log("1 document updated");
				resolve("Data update successful");
				db.close();
			});
		});
	});
};
/*--------------------------------------------------------------------------------------------------*/

/*----------------------------    Authenticating the User Credentials    ----------------------------*/
app.post('/authenticateUser', urlencodedParser, function(req,res){
    var found = false;
    var query = { userId: req.body.username, password: req.body.passwd };
	MongoClient.connect(mongo_url, function(err, db) {
		var dbo = db.db(databaseName);
		if (err) throw err;
		dbo.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			if(result.length){
				currUser = result[0];
				console.log('auth passed'+currUser.userId);
				if(currUser.userId == "190418")
					res.sendFile(__dirname+"/html/userSingle.html");
				else
					res.sendFile(__dirname+"/html/userPage.html");
			}else{
				res.sendFile(__dirname+"/html/login_err.html");
			}
			db.close();
		});
	});
});

/** 	THE SERVER PART FOR THE APP   **/
app.get('/authenticateViaApp/:userId/:passwd',function(req,res){
	var query = {userId: req.params.userId, password: req.params.passwd};
	MongoClient.connect(mongo_url,function(err, db){
		var dbo = db.db(databaseName);
		if (err) throw err;
		dbo.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			if(result.length){
				res.send("Y");
			}
			else{
				res.send("N");
			}
		});
		db.close();
	});
});

app.post('/authenticationPOST', urlencodedParser, function(req,res){
	var rcvd_data = JSON.parse(req.body.message);
	console.log("got in console = "+rcvd_data);
	res.send("response = "+rcvd_data);
});
/**	--------------------------------- **/

/*------------------------------------------------Expense App part--------------------------------------------*/
app.get('/servertest',function(req,res){
	res.send("Server Is Up");
});

app.get('/getExp',function(req,res){

	var theDatabaseName="expenses";
	var tempdata = "";

	MongoClient.connect(mongo_url, function(err, db) {
		var dbo = db.db(theDatabaseName);
		if (err) throw err;
		dbo.collection("exp_manna").find().toArray(function(err, result) {
			if (err) throw err;
			if(result.length){
				var tempdata = JSON.stringify(result);
				console.log("No of rcvd records= "+Object.keys(tempdata).length);
				res.send(tempdata);
			}
			else{
				console.log('Data rcvd is Invalid! Please Recheck.');
				res.send('DATA UNAVAILABLE');
			}
		});
		db.close();
	});
});

app.post('/storeExp', urlencodedParser, function(req,res){
	/*en proceso ----- 14/04/2018*/
	console.log("Android Store service triggered");
	var exp_data = req.body;
	var d = new Date();

	console.log("data json = "+exp_data.date);

	var database = 'expenses';
	var collectionName = 'exp_manna';
	var rcvdData = {
		// exp_data = {"date":"27-Apr-2018","amount":"67","title":"u","comments":"g"} <- input object
		"month" : monthArray[d.getMonth()],
		"year" : d.getFullYear(),
		"exp_date" : exp_data.date,
		"exp_title" : exp_data.title,
		"amount" : exp_data.amount,
		"comment" : exp_data.comments
	};
	insertIntoDB(database,collectionName,rcvdData);
	res.send("Data Updated Successfully");
});

app.post('/storeExpWebApp', urlencodedParser, function(req,res){
	console.log("WebApp service triggered");
	var exp_data = req.body;
	 
	//02-DEC-2018 MONTH TAKING FROM USER SENT DATA [IMPLEMENTED SUCCESFULLY]
	var rcvdDate = exp_data.date;
	var dateInFormat = rcvdDate.substr(rcvdDate.length-4,4)+"-"+rcvdDate.substr(rcvdDate.length-7,2)+"-"+rcvdDate.substr(0,rcvdDate.match('-').index); //manually changing date to International Format i.e., YYYY-MM-DD
	var d = new Date(dateInFormat);	
	console.log("RCVD Data = "+JSON.stringify(exp_data));

	var database = 'expenses';
	var collectionName = 'exp_manna';
	var rcvdData = {
		// exp_data = {"date":"02-12-2018","amount":"67","title":"u","comments":"g"} <- input object
		"month" 	: monthArray[d.getMonth()],
		"year" 		: d.getFullYear(),
		"exp_date" 	: exp_data.date,
		"exp_title" : exp_data.title,
		"amount" 	: exp_data.amount,
		"mop" 		: exp_data.mop,
		"comment" 	: exp_data.comments
	};
	insertIntoDB(database,collectionName,rcvdData);
	res.send("Data Updated Successfully");
});

app.post('/updateExpenseData', urlencodedParser, function(req,res){
	console.log("TRIGGERING UPDATE POST CALL");

	var query = {_id: mongodb.ObjectId(req.body.id)};
	var new_data = req.body.exp;
	console.log(req.body);
	console.log(query);
	console.log(new_data);
	updateDB("expenses","exp_manna",query,new_data).then(function(p_resolve_mesg){
		console.log('Data Updated');
		res.send(p_resolve_mesg);
	}).catch(function(p_reject_mesg){
		console.log('Unable to update data with err_mesg: '+p_reject_mesg);
		res.send('error updating data');
	});

});

app.get('/deleteExpense/:exp_id',function(req,res){
	var query = {_id: mongodb.ObjectId(req.params.exp_id)};
	console.log(query);
	console.log("deleting file with id: "+req.params.exp_id);
	deleteFromDB("expenses","exp_manna",query).then(function(p_resolve_mesg){
		console.log('Data deleted succesfully'+p_resolve_mesg);
		res.send(p_resolve_mesg);
	}).catch(function(p_reject_mesg){
		console.log('Unable to delete data with err_mesg: '+p_reject_mesg);
		res.send("error deleting the document(s)");
	});
});

app.get('/getMonthWiseExpense/:sel_month',function(req,res){
	var lv_theDatabaseName="expenses";
	var lv_theCollectionName="exp_manna";
	var lv_query = {month: monthArray[concatMonth.search(new RegExp(req.params.sel_month, "i"))/3]};
	var lv_outputJSON = null;
	console.log('Querying for month: '+req.params.sel_month);
	extractFromDB(lv_theDatabaseName,lv_theCollectionName,lv_query).then(function(lv_ret_result){
		res.send(JSON.stringify(lv_ret_result));
	}).catch(function(lv_reject_err_msg){
		console.log('Failed to load data '+lv_reject_err_msg);
		res.send({});
	});
});


//--------------------------- expense app server side ends here ----------------------------------//


/*--------------------------- ORACLE JOB APP -SERVER SIDE ---------------------------------------*/
app.post('/saveOrcJob',urlencodedParser, function(req,res){
	console.log("TRIGGERING ORACLE-WORK SAVING FUNCTION");

	console.log(req.body);
	res.send('WIP');

});
app.get('/getProjectData/:proj_id',urlencodedParser, function(req,res){
	var lv_databaseName='oracle';
	var lv_collectionName='oracle_jobs';
	console.log('rcvd param: '+parseInt(req.params.proj_id));
	var lv_query = {projId : parseInt(req.params.proj_id)};
	extractFromDB(lv_databaseName,lv_collectionName,lv_query).then(function(lv_ret_result){
		res.send(JSON.stringify(lv_ret_result));
	}).catch(function(lv_reject_err_msg){
		console.log('Failed to load data '+lv_reject_err_msg);
		res.send({});
	});
});
app.get('/getAllProjectTitles',urlencodedParser, function(req,res){
	//extracting the titles and projId from the DB
	var lv_databaseName='oracle';
	var lv_collectionName='oracle_jobs';
	var lv_query = {};
	extractFromDB(lv_databaseName,lv_collectionName,lv_query).then(function(lv_ret_result){
		var titleList = [];
		for (var iterator in lv_ret_result){
			var temp_data = {title: lv_ret_result[iterator].title, projId: lv_ret_result[iterator].projId};
			titleList.push(temp_data);
		}
		/*res.send(JSON.stringify(titleList));*/
		res.send(titleList);
	}).catch(function(lv_reject_err_msg){
		console.log('Failed to load data '+lv_reject_err_msg);
		res.send({});
	});

});
//------------------------------------- oracle job ends here -------------------------------------//



/*---------------------------- AMEX CODE SERVER-SIDE [START]---------------------------------*/
/*--read file example--*/
app.get('/getNewsHeadlines',function(req,res){
	console.log('ACCESS RUNNING HERE');
	//res.send("DATA GENERATION IN PROGRESS");
	fs.readFile('./temp_amex/news_bulletin666200b.csv',function(err,data){
        if (err)
            console.log("error reading news_bulletin666200b.csv file");
        else{
            console.log("news_bulletin666200b.csv file loaded succesfully");
			var arr = data.toString();
			var lines = arr.split('\n');

			var jsonObj_result = [];

			for(var i=0;i<lines.length;i++){

				var obj = {};
				var currentline=lines[i].split(",");

				obj.headline_id = currentline[0];
				obj.headline = currentline[1];
				obj.url = currentline[2];
				obj.loc = currentline[3];
				obj.cat = currentline[4];
				obj.home_site = currentline[5];
				obj.unique_id = currentline[6];

				jsonObj_result.push(obj);
			}
			//res.writeHead(200, {'content-type':'text/html'});
			res.send(jsonObj_result);
			console.log(jsonObj_result);

			//res.send(arr);
			res.end;
        }
    });
});

/*----------------------------- AMEX CODE SERVER-SIDE [END]----------------------------------*/
/* Running the Server CODE */
var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Multipurpose SERVER IS UP AND LISTENING AT https://%s:%s\nIntegrated with MONGODB", host, port);
  console.log("Currently running apps: \n1 Expense App\n2 Oracle Jobs App\n3 AMEX mini app\nand Multiple webservices");
});
