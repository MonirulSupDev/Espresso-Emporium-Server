const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-yaazx3y-shard-00-00.rdmmvfx.mongodb.net:27017,ac-yaazx3y-shard-00-01.rdmmvfx.mongodb.net:27017,ac-yaazx3y-shard-00-02.rdmmvfx.mongodb.net:27017/?ssl=true&replicaSet=atlas-ijjem0-shard-0&authSource=admin`
);

const coffeeCollection = client.db("coffeeDB").collection("coffee");
const userCollection = client.db("coffeeDB").collection("user");

// ---------- Coffee routes ----------
app.post("/coffee", async (req, res) => {
    const result = await coffeeCollection.insertOne(req.body);
    res.send(result);
});

app.get("/coffee", async (req, res) => {
    const result = await coffeeCollection.find().toArray();
    res.send(result);
});

app.get("/coffee/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await coffeeCollection.findOne(query);
    res.send(result);
});

app.put("/coffee/:id", async (req, res) => {
    const filter = { _id: new ObjectId(req.params.id) };
    const options = { upsert: true };
    const c = req.body;
    const coffee = {
        $set: {
            name: c.name,
            chef: c.chef,
            supplier: c.supplier,
            taste: c.taste,
            category: c.category,
            details: c.details,
            price: c.price,
            photo: c.photo,
        },
    };
    const result = await coffeeCollection.updateOne(filter, coffee, options);
    res.send(result);
});

app.delete("/coffee/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await coffeeCollection.deleteOne(query);
    res.send(result);
});

// ---------- User routes ----------
app.post("/user", async (req, res) => {
    const result = await userCollection.insertOne(req.body);
    res.send(result);
});

app.get("/user", async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
});

app.get("/user/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await userCollection.findOne(query);
    res.send(result);
});

app.put("/user/:id", async (req, res) => {
    const filter = { _id: new ObjectId(req.params.id) };
    const options = { upsert: true };
    const u = req.body;
    const user = { $set: { name: u.name, email: u.email } };
    const result = await userCollection.updateOne(filter, user, options);
    res.send(result);
});

app.patch("/user", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { lastLoggedAt: user.lastLoggedAt } };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
});

app.delete("/user/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await userCollection.deleteOne(query);
    res.send(result);
});

app.get("/", (req, res) => {
    res.send("Coffee store server is running...!!");
});

// Only listen when running locally (node index.js)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Coffee store server is running on port: ${port}`);
    });
}

module.exports = app; // required by Vercel