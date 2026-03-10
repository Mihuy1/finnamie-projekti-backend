import mysql from "mysql2/promise";
import mariadb from "mariadb";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT) || 4000,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 5,
//   queueLimit: 0,
//   dateStrings: true,
//   // ssl: {
//   //   minVersion: "TLSv1.2",
//   //   rejectUnauthorized: true,
//   // },
// });

export default pool;
