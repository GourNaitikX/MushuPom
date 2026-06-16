const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const SECRET_KEY = 'SpadeBotBackup'; // Must match the Master Bot

app.get('/get-data', async (req, res) => {
    // Security check
    if (req.query.key !== SECRET_KEY) {
        return res.status(403).send('Unauthorized');
    }
    
    try {
        // Automatically connects to this specific project's database
        const client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        
        const db = client.db(); 
        const collections = await db.listCollections().toArray();
        
        let dbDump = {};
        for (let col of collections) {
            dbDump[col.name] = await db.collection(col.name).find({}).toArray();
        }
        
        await client.close();
        res.json(dbDump);
    } catch (e) {
        res.status(500).send("Error fetching database: " + e.message);
    }
});

// Railway uses port 3000 by default, or assigns one dynamically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Backup API sidecar running on port ${PORT}`);
});
