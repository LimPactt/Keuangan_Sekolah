function doGet(request) {
  var htmlOutput = HtmlService.createTemplateFromFile("Login");
  htmlOutput.message = "";
  return htmlOutput
    .evaluate()
    .setTitle("Login - Keuangan Sekolah")
    .setFaviconUrl(
      "https://drive.google.com/uc?export=view&id=1HT8AowGqK_41zS-zMNbRgbeJuCkWC1PB"
    )
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**  INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function globalVariables() {
  var varArray = {
    spreadsheetId: "1K8PWrOnCl5reKdBJ3kKfNjMjlSbBPoaaZ4ctmvQI8UM",
    dataRange: "Data!A2:H", // Sesuaikan dengan jumlah kolom di sheet
    idRange: "Data!A2:A",
    lastCol: "H", // Sesuaikan dengan kolom terakhir
    insertRange: "Data!A1:H1", // Sesuaikan dengan jumlah kolom
    sheetID: "0",
  };
  return varArray;
}

/**  PROCESS FORM */
function processForm(formObject) {
  const userRole = Session.getActiveUser().getEmail() || "ADMIN";
  const config = getSheetConfig(userRole);

  /**--Execute if form passes an ID and if is an existing ID */
  if (formObject.RecId && checkID(formObject.RecId, config)) {
    /**--Update Data */
    updateData(
      getFormValues(formObject, userRole),
      config.spreadsheetId,
      getRangeByID(formObject.RecId, config)
    );
  } else {
    /**--Execute if form does not pass an ID
     **--Append Form Data */
    appendData(
      getFormValues(formObject, userRole),
      config.spreadsheetId,
      config.insertRange
    );
  }

  //Return last 10 rows
  return getAllData(userRole);
}

var folder1 = DriveApp.getFolderById("1qDHmNMPJuDWtEyr5VoGEazXuGJA_SoNu"); //folder untuk dokumen santri

var fileSlide = DriveApp.getFileById(
  "1o_RhICV0rKmJEy6JQ8whUjeH8OD9w6Cfp8-oN6GxUts"
); //ID Template Google Slide
var folderPdf = DriveApp.getFolderById("1fNFoLclgBCcimSW0ceNjR1xB3fe0yhbr"); // ID Folder Penampung File PDF

/**  GET FORM VALUES AS AN ARRAY */
function getFormValues(formObject, userRole) {
  const timestamp = new Date().toLocaleString();
  let values = [];

  switch (userRole) {
    case "USERPEMASUKAN":
      values = [
        [
          timestamp,
          formObject.kategori,
          formObject.deskripsi,
          parseFloat(formObject.jumlah),
          formObject.tanggal,
          formObject.keterangan,
          Session.getActiveUser().getEmail(),
        ],
      ];
      break;
    case "USERPENGELUARAN":
      values = [
        [
          timestamp,
          formObject.kategori,
          formObject.deskripsi,
          parseFloat(formObject.jumlah),
          formObject.tanggal,
          formObject.keterangan,
          Session.getActiveUser().getEmail(),
        ],
      ];
      break;
    default:
      values = [
        [
          timestamp,
          formObject.nama,
          formObject.kategori,
          formObject.deskripsi,
          parseFloat(formObject.jumlah),
          formObject.tanggal,
          formObject.keterangan,
          Session.getActiveUser().getEmail(),
        ],
      ];
  }
  return values;
}

/** 
## CURD FUNCTIONS ----------------------------------------------------------------------------------------
*/

/**  CREATE/ APPEND DATA */
function appendData(values, spreadsheetId, range) {
  var valueRange = {
    values: values,
  };
  var results = Sheets.Spreadsheets.Values.append(
    valueRange,
    spreadsheetId,
    range,
    {
      valueInputOption: "RAW",
    }
  );
}

/**  READ DATA */
function readData(spreadsheetId, range) {
  var result = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
  return result.values;
}

/**  UPDATE DATA */
function updateData(values, spreadsheetId, range) {
  var valueRange = {
    values: values,
  };
  var result = Sheets.Spreadsheets.Values.update(
    valueRange,
    spreadsheetId,
    range,
    {
      valueInputOption: "RAW",
    }
  );
}

/** DELETE DATA */
function deleteData(ID) {
  var startIndex = getRowIndexByID(ID);

  var deleteRange = {
    sheetId: globalVariables().sheetID,
    dimension: "ROWS",
    startIndex: startIndex,
    endIndex: startIndex + 1,
  };

  var deleteRequest = [
    {
      deleteDimension: {
        range: deleteRange,
      },
    },
  ];
  Sheets.Spreadsheets.batchUpdate(
    {
      requests: deleteRequest,
    },
    globalVariables().spreadsheetId
  );

  return getAllData();
}

/** 
## HELPER FUNCTIONS FOR CRUD OPERATIONS --------------------------------------------------------------
*/

/**  CHECK FOR EXISTING ID, RETURN BOOLEAN */
function checkID(ID, config) {
  var idList = readData(config.spreadsheetId, config.idRange).reduce(
    (a, b) => a.concat(b),
    []
  );
  return idList.includes(ID);
}

/**  GET DATA RANGE A1 NOTATION FOR GIVEN ID */
function getRangeByID(id, config) {
  if (id) {
    var idList = readData(
      globalVariables().spreadsheetId,
      globalVariables().idRange
    );
    for (var i = 0; i < idList.length; i++) {
      if (id == idList[i][0]) {
        return "Data!A" + (i + 2) + ":" + globalVariables().lastCol + (i + 2);
      }
    }
  }
}

/**  GET RECORD BY ID */
function getRecordById(id, userRole) {
  const config = getSheetConfig(userRole);
  if (id && checkID(id, config)) {
    return readData(config.spreadsheetId, getRangeByID(id, config));
  }
  return null;
}

/**  GET ROW NUMBER FOR GIVEN ID */
function getRowIndexByID(id) {
  if (id) {
    var idList = readData(
      globalVariables().spreadsheetId,
      globalVariables().idRange
    );
    for (var i = 0; i < idList.length; i++) {
      if (id == idList[i][0]) {
        var rowIndex = parseInt(i + 1);
        return rowIndex;
      }
    }
  }
}

/**  GET ALL RECORDS */
function getAllData(userRole) {
  const config = getSheetConfig(userRole);
  return readData(config.spreadsheetId, config.dataRange);
}

/*GET DROPDOWN LIST KOTA */
function getDropdownListKota(range) {
  var list = readData(globalVariables().spreadsheetId, range);
  return list;
}

function getNewHtml(e) {
  var html = HtmlService.createTemplateFromFile("Index") // uses templated html
    .evaluate()
    .getContent();
  return html;
}

function myURL() {
  return ScriptApp.getService().getUrl();
}

function cekLogin(username, password, rule) {
  const users = {
    admin: {
      username: "admin",
      password: "admin123",
      role: "ADMIN",
    },
    userpemasukan: {
      username: "userpemasukan",
      password: "pemasukan123",
      role: "USERPEMASUKAN",
    },
    userpengeluaran: {
      username: "userpengeluaran",
      password: "pengeluaran123",
      role: "USERPENGELUARAN",
    },
  };

  const user = users[rule];
  if (user && user.username === username && user.password === password) {
    return user.role;
  }
  return "FALSE";
}

function doPost(e) {
  Logger.log(JSON.stringify(e));
  if (e.parameter.LoginButton === "Login") {
    var username = e.parameter.username;
    var password = e.parameter.password;
    var rule = e.parameter.rule;
    var validasi = cekLogin(username, password, rule);
    var htmlOutput;

    switch (validasi) {
      case "ADMIN":
        htmlOutput = HtmlService.createTemplateFromFile("Admin");
        break;
      case "USERPEMASUKAN":
        htmlOutput = HtmlService.createTemplateFromFile("UserPemasukan");
        break;
      case "USERPENGELUARAN":
        htmlOutput = HtmlService.createTemplateFromFile("UserPengeluaran");
        break;
      default:
        htmlOutput = HtmlService.createTemplateFromFile("Login");
        htmlOutput.message =
          "Login gagal! Silakan cek kembali username dan password anda.";
        break;
    }

    htmlOutput.userRole = validasi;
    return htmlOutput
      .evaluate()
      .setTitle("TITLE")
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Data sheets configuration
function getSheetConfig(userRole) {
  const config = {
    ADMIN: {
      spreadsheetId: "1K8PWrOnCl5reKdBJ3kKfNjMjlSbBPoaaZ4ctmvQI8UM",
      dataRange: "Data!A2:H",
      idRange: "Data!A2:A",
      lastCol: "H",
      insertRange: "Data!A1:H1",
      sheetID: "0",
    },
    USERPEMASUKAN: {
      spreadsheetId: "1K8PWrOnCl5reKdBJ3kKfNjMjlSbBPoaaZ4ctmvQI8UM",
      dataRange: "Pemasukan!A2:G",
      idRange: "Pemasukan!A2:A",
      lastCol: "G",
      insertRange: "Pemasukan!A1:G1",
      sheetID: "1",
    },
    USERPENGELUARAN: {
      spreadsheetId: "1K8PWrOnCl5reKdBJ3kKfNjMjlSbBPoaaZ4ctmvQI8UM",
      dataRange: "Pengeluaran!A2:G",
      idRange: "Pengeluaran!A2:A",
      lastCol: "G",
      insertRange: "Pengeluaran!A1:G1",
      sheetID: "2",
    },
  };
  return config[userRole] || config.ADMIN;
}

// Specialized functions for different roles
function getAllPemasukanData() {
  return getAllData("USERPEMASUKAN");
}

function getAllPengeluaranData() {
  return getAllData("USERPENGELUARAN");
}

function processPemasukanForm(formObject) {
  return processForm(Object.assign(formObject, { role: "USERPEMASUKAN" }));
}

function processPengeluaranForm(formObject) {
  return processForm(Object.assign(formObject, { role: "USERPENGELUARAN" }));
}

function getDashboardStats() {
  const pemasukanData = getAllPemasukanData();
  const pengeluaranData = getAllPengeluaranData();

  const totalPemasukan = pemasukanData.reduce(
    (sum, row) => sum + (parseFloat(row[3]) || 0),
    0
  );
  const totalPengeluaran = pengeluaranData.reduce(
    (sum, row) => sum + (parseFloat(row[3]) || 0),
    0
  );

  return {
    totalPemasukan: totalPemasukan,
    totalPengeluaran: totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    jumlahPemasukan: pemasukanData.length,
    jumlahPengeluaran: pengeluaranData.length,
  };
}
