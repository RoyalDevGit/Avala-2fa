const totp = require("totp-generator");
const sqlite3 = require('sqlite3').verbose();
const BAD_CODES = require('./badCodes');
const db = new sqlite3.Database('./codes.db');

db.run('CREATE TABLE IF NOT EXISTS codes(code TEXT)');

function createCode() {
  const token = totp();
  if (BAD_CODES.includes(token)) {
    console.log('Bad code');
    return;
  }
  db.serialize(() => {
    db.get('select * from codes where code=?', [token], (err, row) => {
      if (row) {
        createCode();
        return;
      }
      else {
        db.run('insert into codes(code) values (?)', [token], (err) => {
          if (!err)
            console.log(token);
          else
            throw err;
        })
      }
    })
  })
}

(function () {
  createCode();
})()