// const axios = require('axios');
// const libFuncion = require('../helper/libFunction');
const accountSid = 'AC8aaa0283a0ae9b6d60fe06a1fab34b90';
const authToken = '5cdffd03ab38dd5c9a3501b553ebb789';
const client = require('twilio')(accountSid, authToken);
// const con = require("../database/db")

// const XLSX = require('xlsx');
const path = require('path');
// const print = require('printer')
// const printers = require('node-printer');

const csv = require('csv-parser');
const fs = require('fs');
// const mysql = require('mysql');
const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'mailallcenter',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

const get_home = async (req, res) => {
    try {

    const filePath = path.join(__dirname, '../uploads', 'mail.csv');
    console.log(filePath);
    const csvContent = [];
    if (fs.existsSync(filePath)) {
      let rowCount = 0;
 
    fs.createReadStream(filePath)
  .pipe(csv({ headers: false }))
  .on('data', (data) => 
  {
    rowCount++;
    if (rowCount > 6) {
      if (data['4']) {
          data['4'] = data['4'].replace(/\D/g, ''); 
        }
      csvContent.push(data);
    }})
  .on('end', () => {
      // console.log(csvContent[0], csvContent[1], csvContent[2])
      console.log(csvContent);
      const specificFields = csvContent.map(row => ({ '0': row['0'], '3': row['3'], '4': row['4'] }));

        res.render('home', { csvContent:specificFields });
  });
  
    } else {
        res.render('home',{ noCsv: true });
    }

    } catch (err) {
        console.error(err.message);
        res.send(err.message);
    }
}
const get_upload = async (req, res) => { 
    try {
      res.render('upload',{ noCsv: false });
} catch (err) {
    console.error(err.message);
    res.send(err.message);
}
}
const post_upload = async (req, res) => {
try {
    const filePath = req.file.path;
    let rowCount = 0;
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv({ headers: false }))
    .on('data', (data) => 
    {
      rowCount++;
      if (rowCount > 6) {
        if (data['4']) {
            data['4'] = data['4'].replace(/\D/g, ''); 
          }
        results.push(data);
        
      }})
    .on('end', () => {
        console.log(results[0], results[1], results[2])

      const csvContent = JSON.stringify(results, null, 2);
    //   console.log(csvContent);
    res.render('upload',{ noCsv: true });
    });
    
} catch (err) {
    console.error(err.message);
    res.send(err.message);
}   
    
}

const send_sms = async (req, res) => {
    try {
        console.log(req.body, ";;;;;;;;;;")
        const mailbox = req.body['tag-input'];
        const tracking = req.body.cuisine;
        const package = "package"
        const msg = `Dear mailbox owner of ${mailbox}, your ${package} with tracking no. ${tracking} has arrived`
        console.log(`Dear mailbox owner of ${mailbox}, your ${package} with tracking no. ${tracking} has arrived.`)
            const API_KEY = process.env.API_KEY;
        const datenew = new Date();
        const formattedDate = datenew.toISOString().slice(0, 19).replace("T", " ");
        
        console.log('Formatted Date:', formattedDate);
        console.log(datenew, "/////////////");
        promisePool.query(`INSERT INTO incoming (mailbox, timestamp, flag_picked, flag_deleted)
        VALUES (${mailbox}, '${formattedDate}', 0, 0);`)
        .then(([rows, fields]) => {
console.log(rows, "rows");
        })

        const filePath = path.join(__dirname, '../uploads', 'mail.csv');
        console.log(filePath);
        const csvContent = [];
        if (fs.existsSync(filePath)) {
          let rowCount = 0;
        fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on('data', (data) => 
      {
        rowCount++;
        if (rowCount > 6) {
          if (data['4']) {
              data['4'] = data['4'].replace(/\D/g, ''); 
            }
          csvContent.push(data);
        }})
      .on('end', () => {
          console.log(csvContent, "::::::::::::::::::::::::::::::::::::::::::::::")
          const phone = csvContent.map(obj => obj['0'] == mailbox ? obj['4'] : null).find(value => value !== null);

console.log("Value of '4' where '0'=5001:", phone);
client.messages
.create({
   body: msg,
   from: '+16504050844',
   to: `+1${phone}`
// to: '+14083415122'
 })
.then(message => console.log(message.sid, message.status));
res.send(true)
      });
    }       
    } catch (err) {
        console.error(err.message);
        res.send(err.message);
    }
}

const get_package = async (req, res) => { 
  try {
    const sqlQuery = 'SELECT * FROM mailallcenter.incoming';
promisePool.query(sqlQuery)
  .then(([rows, fields]) => {
    console.log('Query result:', rows);
    res.render('manage');
  })
} catch (err) {
  console.error(err.message);
  res.send(err.message);
}
}
// const get_printer = async (req, res) => { 
//   try {
//     const printerrrr = print.getPrinters()
//     console.log(printerrrr,":::")
//     const printQueue = printers.list();
//     console.log(printQueue, ":::::::::::::")
//     var printer = new printers('Zebra_ZP_505');
//     var text = 'Print text directly, when needed: e.g. barcode printers'
//     var jobFromText = printer.printText(text);
//   //   printers.printDirect({
//   //     data: "hiiiii",
//   //     type: 'RAW',
//   //     printer: 'Zebra_ZP_505', 
//   //     success: function(jobID){
//   //         console.log('Label printed with ID:', jobID);
//   //         res.status(200).send('Label printed successfully');
//   //     },
//   //     error: function(err){
//   //         console.error('Error printing label:', err);
//   //         res.status(500).send('Error printing label');
//   //     }
//   // });
// } catch (err) {
//   console.error(err.message);
//   res.send(err.message);
// }
// }
module.exports = {
    get_home,
    send_sms,
    get_upload,
    post_upload,
    get_package
};