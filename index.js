const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-yaazx3y-shard-00-00.rdmmvfx.mongodb.net:27017,ac-yaazx3y-shard-00-01.rdmmvfx.mongodb.net:27017,ac-yaazx3y-shard-00-02.rdmmvfx.mongodb.net:27017/?ssl=true&replicaSet=atlas-ijjem0-shard-0&authSource=admin`);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");

        // Creating database in mongodb
        const coffeeCollection = client.db("coffeeDB").collection("coffee");

        // Adding new coffee to database
        app.post("/coffee", async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        // Getting all coffee to show on client site
        app.get("/coffee", async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Update a coffee
        app.get("/coffee/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })
        // Changing field values for update
        app.put("/coffee/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;
            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    price: updatedCoffee.price,
                    photo: updatedCoffee.photo,
                }
            }
            const result = await coffeeCollection.updateOne(filter, coffee, options);
            res.send(result);
        })

        // Delete coffee
        app.delete("/coffee/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        return client;
    } catch (err) {
        console.dir(err);
    }
}

app.get("/", (req, res) => {
    res.send("Coffee store server is running...!!");
})

connectToMongoDB().then(() => {
    app.listen(port, () => {
        console.log(`Coffee store server is running on port: ${port}`);
    })
})

module.exports = { connectToMongoDB };