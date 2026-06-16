const { MongoClient } = require('mongodb');
const fs = require('fs');

const mongoUrl = process.env.MONGO_URL; 

// This async wrapper runs automatically when required by index.js
(async () => {
    if (!mongoUrl) {
        console.log("⚠️ Automated backup skipped: MONGO_URL is not set.");
        return;
    }

    let client;
    try {
        client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db('VipBotDB'); 
        
        let dbDump = {};
        
        // Safely await the collections
        const collections = await db.listCollections().toArray();
        
        // Loop through and backup each collection without syntax errors
        for (let col of collections) {
            dbDump[col.name] = await db.collection(col.name).find({}).toArray();
        }
        
        // Write backup to a local file
        fs.writeFileSync('database_backup.json', JSON.stringify(dbDump, null, 2));
        console.log("✅ Automated database backup completed successfully!");

    } catch (error) {
        console.error("❌ Backup Script Failed:", error);
    } finally {
        if (client) {
            await client.close();
        }
    }
})();
