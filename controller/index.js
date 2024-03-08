// const axios = require('axios');
// const libFuncion = require('../helper/libFunction');
const accountSid = 'AC8aaa0283a0ae9b6d60fe06a1fab34b90';
const authToken = '3646108e832191e141900c42341d2481';
const client = require('twilio')(accountSid, authToken);
// const con = require("../database/db")

// const XLSX = require('xlsx');
const path = require('path');


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
  connectionLimit: 10, // Adjust the number of connections as needed
  queueLimit: 0
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

const get_home = async (req, res) => {
    try {
// Example query
const sqlQuery = 'SELECT * FROM mailallcenter.incoming';

// Using promise-based connection
promisePool.query(sqlQuery)
  .then(([rows, fields]) => {
    console.log('Query result:', rows);

    const filePath = path.join(__dirname, '../uploads', 'mail.csv');
    console.log(filePath);
    const csvContent = [];
    // Check if the file 'mail.csv' exists
    if (fs.existsSync(filePath)) {
      let rowCount = 0;
 
    fs.createReadStream(filePath)
  .pipe(csv({ headers: false }))
  .on('data', (data) => 
  {
    rowCount++;
    if (rowCount > 6) {
      if (data['4']) {
          data['4'] = data['4'].replace(/\D/g, ''); // Remove non-numeric characters
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
        // Render 'home.ejs' without csvContent
        res.render('home',{ noCsv: true });
    }


  })
  .catch((err) => {
    console.error('Error executing query:', err);
  });


    // const resp= await pool.query('SELECT * FROM mailallcenter.incoming')
    // console.log(resp, "..............");
    // client.release();

     
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
            data['4'] = data['4'].replace(/\D/g, ''); // Remove non-numeric characters
          }
        results.push(data);
        
      }})
    .on('end', () => {
        console.log(results[0], results[1], results[2])
      // Display CSV content on the page
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

        // const workbook = XLSX.readFile(filePath);
        // const sheetName = workbook.SheetNames[0];
        // const worksheet = workbook.Sheets[sheetName];
        //     const data = XLSX.utils.sheet_to_json(worksheet);
        //     console.log(data);
        //     const filteredData = data.filter(item => item.Mailbox === parseInt(mailbox));
        //     console.log(filteredData);





// client.messages
// .create({
//    body: msg,
//    from: '+16504050844',
//   //  to: `+${filteredData[0]['Phone']}`
// to: '+14083415122'
//  })
// .then(message => console.log(message.sid, message.status));
            res.send(true)
    
            
    } catch (err) {
        console.error(err.message);
        res.send(err.message);
    }
}

const get_pickup = async (req, res) => { 
  try {
    res.render('upload',{ noCsv: false });
} catch (err) {
  console.error(err.message);
  res.send(err.message);
}
}

module.exports = {
    get_home,
    send_sms,
    get_upload,
    post_upload,
    get_pickup,
};