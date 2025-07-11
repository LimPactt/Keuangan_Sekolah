function doGet(request) {
	var htmlOutput = HtmlService.createTemplateFromFile('Login');
  htmlOutput.message = '';
  return htmlOutput.evaluate()
    .setTitle('CRUD Data')
    .setFaviconUrl('https://drive.google.com/uc?export=view&id=1HT8AowGqK_41zS-zMNbRgbeJuCkWC1PB.ico')
		.addMetaTag('viewport', 'width=device-width , initial-scale=1')
		.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    
}

/**  INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES */
function include(filename) {
	return HtmlService.createHtmlOutputFromFile(filename)
		.getContent();
}

function globalVariables() {
	var varArray = {
		spreadsheetId: '1HBvV_h7Ck2FMQ0LuOQA4uKn14wVYDYUCS_BSc5wL9YU',
		dataRange: 'Data!A3:K',
		idRange: 'Data!A2:A',
		lastCol: 'K',
		insertRange: 'Data!A1:K1',
		sheetID: '0'
	};
	return varArray;
}

/**  PROCESS FORM */
function processForm(formObject) {

	/**--Execute if form passes an ID and if is an existing ID */
	if (formObject.RecId && checkID(formObject.RecId)) {

		/**--Update Data */
		updateData(getFormValues(formObject), globalVariables().spreadsheetId, getRangeByID(formObject.RecId));
	} else {

		/**--Execute if form does not pass an ID
		 **--Append Form Data */
		appendData(getFormValues(formObject), globalVariables().spreadsheetId, globalVariables().insertRange);
	}

	//Return last 10 rows
	return getAllData();
}

var folder1 = DriveApp.getFolderById('1qDHmNMPJuDWtEyr5VoGEazXuGJA_SoNu');//ganti fd dengan id folder
var folder2 = DriveApp.getFolderById('1eE7YcqjdUJamcrQcyunW4hcaGIB3q7pz');//ganti fd dengan id folder

var fileSlide = DriveApp.getFileById('1o_RhICV0rKmJEy6JQ8whUjeH8OD9w6Cfp8-oN6GxUts') //ID Template Google Slide
var folderPdf = DriveApp.getFolderById('1fNFoLclgBCcimSW0ceNjR1xB3fe0yhbr'); // ID Folder Penampung File PDF




/**  GET FORM VALUES AS AN ARRAY */
function getFormValues(formObject) {

	/**  ADD OR REMOVE VARIABLES ACCORDING TO YOUR FORM */
	if (formObject.RecId && checkID(formObject.RecId)) {

    if (formObject.myFile1 && formObject.myFile2.length > 0) {
      var blob1 = formObject.myFile1;
      var blob2 = formObject.myFile2;
      var file1 = folder1.createFile(blob1);
      var file2 = folder2.createFile(blob2);
      file1 = file1.getUrl();
      file2 = file2.getUrl();
    }  

      var copyFile = fileSlide.makeCopy(formObject.nama && formObject.RecId);
      var copyId = copyFile.getId()
      var copyDoc = SlidesApp.openById(copyId);

      //---masukkan data --sesuaikan dengan template google slide---//

      copyDoc.replaceAllText('{TanggalCetak}', new Date().toLocaleString())
      copyDoc.replaceAllText('{Nama}', formObject.nama)
      copyDoc.replaceAllText('{Email}', formObject.email)
      copyDoc.replaceAllText('{Telepon}', formObject.telp)
      copyDoc.replaceAllText('{Gender}', formObject.gender)
      copyDoc.replaceAllText('{TanggalLahir}', formObject.tglLahir)
      copyDoc.replaceAllText('{Kota}', formObject.kota)
      copyDoc.saveAndClose()
      var filePdf = folderPdf.createFile(copyFile.getAs("application/pdf"));
      var pdfUrl = filePdf.getUrl()
      copyFile.setTrashed(true);


		var values = [
			[formObject.RecId.toString(),
				formObject.nama,
				formObject.email,
				formObject.telp,
				formObject.gender,
				formObject.tglLahir,
				formObject.kota,
        file1,
        file2,
        pdfUrl,
				new Date().toLocaleString()
			]
		];
	} else {

    if (formObject.myFile1 && formObject.myFile2.length > 0) {
      var blob1 = formObject.myFile1;
      var blob2 = formObject.myFile2;
      var file1 = folder1.createFile(blob1);
      var file2 = folder2.createFile(blob2);
      file1 = file1.getUrl();
      file2 = file2.getUrl();
    }  

      var copyFile = fileSlide.makeCopy(formObject.nama && formObject.RecId);
      var copyId = copyFile.getId()
      var copyDoc = SlidesApp.openById(copyId);

      //---masukkan data --sesuaikan dengan template google slide---//

      copyDoc.replaceAllText('{TanggalCetak}', new Date().toLocaleString())
      copyDoc.replaceAllText('{Nama}', formObject.nama)
      copyDoc.replaceAllText('{Email}', formObject.email)
      copyDoc.replaceAllText('{Telepon}', formObject.telp)
      copyDoc.replaceAllText('{Gender}', formObject.gender)
      copyDoc.replaceAllText('{TanggalLahir}', formObject.tglLahir)
      copyDoc.replaceAllText('{Kota}', formObject.kota)
      copyDoc.saveAndClose()
      var filePdf = folderPdf.createFile(copyFile.getAs("application/pdf"));
      var pdfUrl = filePdf.getUrl()
      copyFile.setTrashed(true);


		/** Reference https://webapps.stackexchange.com/a/51012/244121 */
		var values = [
			[new Date().getTime().toString(),
				formObject.nama,
				formObject.email,
				formObject.telp,
				formObject.gender,
				formObject.tglLahir,
				formObject.kota,
        file1,
        file2,
        pdfUrl,        
				new Date().toLocaleString()
			]
		];
	}
	return values;
}


/** 
## CURD FUNCTIONS ----------------------------------------------------------------------------------------
*/


/**  CREATE/ APPEND DATA */
function appendData(values, spreadsheetId, range) {
	var valueRange = Sheets.newRowData();
	valueRange.values = values;
	var appendRequest = Sheets.newAppendCellsRequest();
	appendRequest.sheetID = spreadsheetId;
	appendRequest.rows = valueRange;
	var results = Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range, {
		valueInputOption: "RAW"
	});
}


/**  READ DATA */
function readData(spreadsheetId, range) {
	var result = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
	return result.values;
}


/**  UPDATE DATA */
function updateData(values, spreadsheetId, range) {
	var valueRange = Sheets.newValueRange();
	valueRange.values = values;
	var result = Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, range, {
		valueInputOption: "RAW"
	});
}


/** DELETE DATA */
function deleteData(ID) {
	var startIndex = getRowIndexByID(ID);

	var deleteRange = {
		"sheetId": globalVariables().sheetID,
		"dimension": "ROWS",
		"startIndex": startIndex,
		"endIndex": startIndex + 1
	}

	var deleteRequest = [{
		"deleteDimension": {
			"range": deleteRange
		}
	}];
	Sheets.Spreadsheets.batchUpdate({
		"requests": deleteRequest
	}, globalVariables().spreadsheetId);

	return getAllData();
}

/** 
## HELPER FUNCTIONS FOR CRUD OPERATIONS --------------------------------------------------------------
*/


/**  CHECK FOR EXISTING ID, RETURN BOOLEAN */
function checkID(ID) {
	var idList = readData(globalVariables()
			.spreadsheetId, globalVariables().idRange, )
		.reduce(function(a, b) {
			return a.concat(b);
		});
	return idList.includes(ID);
}


/**  GET DATA RANGE A1 NOTATION FOR GIVEN ID */
function getRangeByID(id) {
	if (id) {
		var idList = readData(globalVariables().spreadsheetId, globalVariables().idRange);
		for (var i = 0; i < idList.length; i++) {
			if (id == idList[i][0]) {
				return 'Data!A' + (i + 2) + ':' + globalVariables().lastCol + (i + 2);
			}
		}
	}
}


/**  GET RECORD BY ID */
function getRecordById(id) {
	if (id && checkID(id)) {
		var result = readData(globalVariables().spreadsheetId, getRangeByID(id));
		return result;
	}
}


/**  GET ROW NUMBER FOR GIVEN ID */
function getRowIndexByID(id) {
	if (id) {
		var idList = readData(globalVariables().spreadsheetId, globalVariables().idRange);
		for (var i = 0; i < idList.length; i++) {
			if (id == idList[i][0]) {
				var rowIndex = parseInt(i + 1);
				return rowIndex;
			}
		}
	}
}


/**  GET ALL RECORDS */
function getAllData() {
	var data = readData(globalVariables().spreadsheetId, globalVariables().dataRange);
	return data;
}


/*GET DROPDOWN LIST KOTA */
function getDropdownListKota(range) {
	var list = readData(globalVariables().spreadsheetId, range);
	return list;
}

function getNewHtml(e) {
  var html = HtmlService
	.createTemplateFromFile('Index') // uses templated html
	.evaluate()
	.getContent();
  return html;
}

function myURL() {
   return ScriptApp.getService().getUrl();
}

function cekLogin(username, password, rule) {
   var usernames = ['user1', 'user2']; //user array
   var passwords = ['user1', 'user2']; //password array
   var rules = ['admin', 'user'];
   var cek = '';
   if (cek == '') {
      for (var i = 0; i < usernames.length; i++) {
         if (username == usernames[i] && password == passwords[i] && rule == rules[i] && rule == "admin") {
            cek = 'ADMIN';
         }
      }
   }
   if (cek == '') {
      for (var i = 0; i < usernames.length; i++) {
         if (username == usernames[i] && password == passwords[i] && rule == rules[i] && rule == "user") {
            cek = 'USER';
         }
      }
   }
   if (cek == '') {
      cek = 'FALSE';
   }
   return cek;
}

function doPost(e) {
   Logger.log(JSON.stringify(e));
   if (e.parameter.LoginButton == 'Login') {
      var username = e.parameter.username;
      var password = e.parameter.password;
      var rule = e.parameter.rule;
      var validasi = cekLogin(username, password, rule);

      if (validasi == 'ADMIN') {
         var htmlOutput = HtmlService.createTemplateFromFile('Admin');
         htmlOutput.username = username;
         htmlOutput.message = '';
         return htmlOutput.evaluate()
         .addMetaTag('viewport', 'width=device-width , initial-scale=1')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      } 
      if (validasi == 'USER') {
         var htmlOutput = HtmlService.createTemplateFromFile('User');
         htmlOutput.username = username;
         htmlOutput.message = '';
         return htmlOutput.evaluate()
         .addMetaTag('viewport', 'width=device-width , initial-scale=1')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      } 
      
      else {
         var htmlOutput = HtmlService.createTemplateFromFile('Login');
         htmlOutput.message = 'Login Gagal!';
         return htmlOutput.evaluate()
         .addMetaTag('viewport', 'width=device-width , initial-scale=1')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      }
   }
}
