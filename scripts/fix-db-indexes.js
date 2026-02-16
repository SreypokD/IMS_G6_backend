const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Explicit path
const sequelize = require('../config/database');

console.log("Starting fix script...");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);

async function fix() {
  try {
    console.log("Authenticating...");
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results] = await sequelize.query("SHOW INDEX FROM categories");
    const nameIndexes = results.filter(idx => idx.Column_name === 'name' && idx.Key_name !== 'PRIMARY');
    
    const uniqueKeys = [...new Set(nameIndexes.map(idx => idx.Key_name))];
    
    console.log(`Found ${uniqueKeys.length} indexes on 'name' column.`);
    const toDrop = uniqueKeys; // Drop all and let sync recreate

    if (toDrop.length > 0) {
        for (const keyName of toDrop) {
            console.log(`Dropping index: ${keyName}`);
            try {
                await sequelize.query(`DROP INDEX \`${keyName}\` ON categories`);
            } catch (e) {
                console.error(`Failed to drop ${keyName}: ${e.message}`);
            }
        }
    } else {
        console.log("No indexes found to drop.");
    }
    
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

fix();
