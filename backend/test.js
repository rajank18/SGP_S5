import mysql from "mysql2";

const db = mysql.createConnection({
  host: "sql202.infinityfree.com",
  user: "if0_40419226",
  password: "zl6OUygXmDn",
  database: "if0_40419226_prograde_db",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB CONNECTION FAILED:");
    console.error(err);
    return;
  }
  console.log("✅ Connected to InfinityFree MySQL successfully!");
});
