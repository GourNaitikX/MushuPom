const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

// Tumhari fix ki hui Secret Key
const SECRET_KEY = process.env.BACKUP_SECRET_KEY || 'Spadebotbackup';

app.get('/get-data', async (req, res) => {
    // 1. Key Match Check (Hacker Protection)
    if (req.query.key !== SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized Access' });
    }
    
    try {
        // 2. Database Connection
        const client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        
        // 3. Auto-Detect Database & Collections (Bina naam likhe)
        const db = client.db(); 
        const collections = await db.listCollections().toArray();
        
        let dbDump = {};
        
        // 4. Har collection ka data loop karke JSON mein add karna
        for (let col of collections) {
            dbDump[col.name] = await db.collection(col.name).find({}).toArray();
        }
        
        await client.close();
        
        // 5. Final JSON Data Return Karna
        res.json(dbDump);
        
    } catch (error) {
        res.status(500).json({ error: "Database fetch error: " + error.message });
    }
});

// Railway port automatically assign karta hai, warna 3000 use karega
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Universal Backup API running on port ${PORT}`);
});
