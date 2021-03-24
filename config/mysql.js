const mysql = require('mysql2');

var pool = mysql.createPool({
    "host" : process.env.MYSQL_HOST,
    "user" : process.env.MYSQL_USER,
    "password" : process.env.MYSQL_PASS,
    "database" : process.env.MYSQL_DATABASE,
    "port" : process.env.MYSQL_PORT
});

exports.pool = pool;