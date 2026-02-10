require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
);

async function fix() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    // 1. Get all indexes on users table
    const [indexes] = await sequelize.query("SHOW INDEX FROM users");
    console.log(`Total indexes on 'users': ${indexes.length}`);

    // 2. Identify email indexes
    // Group by Key_name to count unique indexes
    const keyNames = new Set();
    const emailKeys = [];

    indexes.forEach((idx) => {
      // We are looking for indexes that involve the 'email' column
      if (idx.Column_name === "email") {
        if (!keyNames.has(idx.Key_name)) {
          keyNames.add(idx.Key_name);
          emailKeys.push(idx.Key_name);
        }
      }
    });

    console.log(
      `Found ${emailKeys.length} indexes involved with 'email':`,
      emailKeys,
    );

    if (emailKeys.length > 1) {
      console.log("Keeping the first one and dropping the rest...");
      // Keep the first one (arbitrarily, or maybe 'email' if it exists)
      // If 'email' exists in list, keep it. Otherwise keep the first.
      let keeper = emailKeys.includes("email") ? "email" : emailKeys[0];

      // Also check if there is a 'users_email_unique' or similar standard name
      if (emailKeys.includes("users_email_unique"))
        keeper = "users_email_unique";

      const toDrop = emailKeys.filter((k) => k !== keeper);

      for (const keyName of toDrop) {
        console.log(`Dropping index: ${keyName}`);
        try {
          await sequelize.query(`DROP INDEX \`${keyName}\` ON users`);
        } catch (e) {
          console.error(`Failed to drop ${keyName}: ${e.message}`);
        }
      }
    } else {
      console.log("Email indexes look fine (0 or 1).");
    }

    // Check if we still have too many keys overall
    const [updatedIndexes] = await sequelize.query("SHOW INDEX FROM users");
    console.log(
      `Total indexes on 'users' after cleanup: ${updatedIndexes.length}`,
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

fix();
