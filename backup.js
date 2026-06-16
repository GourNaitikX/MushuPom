const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

const SECRET_KEY = process.env.BACKUP_SECRET_KEY || 'Spadebotbackup';

app.get('/get-data', async (req, res) => {
    if (req.query.key !== SECRET_KEY) return res.status(403).json({ error: 'Unauthorized Access' });
    
    try {
        const client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        
        let dbDump = {};
        
        try {
            // ADVANCED: Scan all databases inside MongoDB automatically
            const adminDb = client.db().admin();
            const dbList = await adminDb.listDatabases();
            
            for (let dbInfo of dbList.databases) {
                // Ignore system databases
                if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
                
                const db = client.db(dbInfo.name);
                const collections = await db.listCollections().toArray();
                
                for (let col of collections) {
                    // Extract all data from the real collection
                    dbDump[`${dbInfo.name}_${col.name}`] = await db.collection(col.name).find({}).toArray();
                }
            }
        } catch (err) {
            // FALLBACK: If advanced scan is restricted, use default URL DB
            const db = client.db();
            const collections = await db.listCollections().toArray();
            for (let col of collections) {
                dbDump[col.name] = await db.collection(col.name).find({}).toArray();
            }
        }
        
        await client.close();
        res.json(dbDump);
        
    } catch (error) {
        res.status(500).json({ error: "Database fetch error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Universal Backup API running on port ${PORT}`);
});
        res.status(500).json({ error: "Database fetch error: " + error.message });
    }
});

// Railway port automatically assign karta hai, warna 3000 use karega
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Universal Backup API running on port ${PORT}`);
});
