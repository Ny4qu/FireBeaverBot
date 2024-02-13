const https = require('https');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const user_images = [
    "https://static.vecteezy.com/system/resources/previews/028/232/132/non_2x/cyberpunk-character-icon-a-dynamic-blend-of-technology-and-style-vector.jpg",
    "https://static.vecteezy.com/system/resources/previews/028/232/131/large_2x/cyberpunk-character-icon-a-dynamic-blend-of-technology-and-style-vector.jpg",
    "https://static.vecteezy.com/system/resources/previews/028/232/019/non_2x/cyberpunk-character-icon-a-dynamic-blend-of-technology-and-style-vector.jpg",
    "https://static.vecteezy.com/system/resources/previews/028/232/023/non_2x/cyberpunk-character-icon-a-dynamic-blend-of-technology-and-style-vector.jpg",
    "https://static.vecteezy.com/system/resources/previews/028/232/062/non_2x/cyberpunk-character-icon-a-dynamic-blend-of-technology-and-style-vector.jpg"
]

const uri = process.env.MONGOURI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function verifyUser(username) {
    let result = [];
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = await client.db("test");
        const collection = db.collection('beavers');
        const query = { "username": username }
        let cursor = collection.find(query);
        result = await cursor.toArray();
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
    return new Promise((resolve) => {
        if(result.length > 0) {
            resolve(result);
        } else {
            resolve({'userExist': false});
        }
    })
}

async function drawHunters() {
    let result = [];
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = await client.db("test");
        const collection = db.collection('players');
        const query = {}
        let cursor = collection.find(query).project({ _id: 0 });
        result = await cursor.toArray();
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
    return new Promise((resolve, reject) => {
        if(result.length > 0) {
            resolve(result[Math.floor(Math.random() * result.length)]);
        } else {
            resolve({'userExist': false});
        }
    })
}

async function addBeaverDB(beaverJSON, username , action, total) {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = await client.db("test");
        const collection = db.collection('beavers');
        switch(action) {
            case 'standard': {
                const query = { "username": username }
                await collection.updateMany(query, {
                    $push: { 'beavers': beaverJSON }
                });
                await collection.updateOne(query, {
                    $set: {'total': total + 1}
                });
                break;
            }
            case 'better': {
                const query = { "username": username }
                await collection.updateMany(query, {
                    $push: { 'beavers': beaverJSON }
                });
                await collection.updateMany(query, {
                    $set: { 'best_beaver': beaverJSON }
                });
                await collection.updateOne(query, {
                    $set: {'total': total + 1}
                });
                break;
            }
            case 'new': {
                let beavers = {
                    'username': username,
                    'user_image': user_images[Math.floor(Math.random() * user_images.length)],
                    'beavers': [beaverJSON],
                    'best_beaver': beaverJSON,
                    'total': 1
                }
                await collection.insertOne(beavers);
                break;
            }
        }
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function checkPlayers(username) {
    let result = [];
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = await client.db("test");
        const collection = db.collection('players');
        let cursor = await collection.find({"username": username});
        result = await cursor.toArray();
        if(result.length === 0) {
            await collection.insertOne({"username": username});
        }
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
    return new Promise((resolve, reject) => {
        if(result.length > 0) {
            resolve({'userExist': true});
        } else {
            resolve({'userExist': false});
        }
    })
}

async function testDB(beaverJSON, username , action) {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = await client.db("Production");
        const collection = db.collection('hunters');
        await collection.rename('beavers');
        // await collection.updateMany(
        //     {"username": "nyaqu"},
        //     { $push: { 'beavers': beaverJSON } }
        // );
        // await collection.updateMany({}, [{ $set: {
        //     beavers: {
        //         $map: {
        //             input: "$beavers",
        //             in: {
        //              rarity_name: "$$this.rarityName"
        //             }
        //         }
        //     }
        //     } }]);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

module.exports = { addBeaverDB , verifyUser, drawHunters , checkPlayers}