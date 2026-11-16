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
        const userCollection = client.db("coffeeDB").collection("user");

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

        // Find coffee to Update
        app.get("/coffee/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })
        // Update coffee
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

        // Adding new User to database
        app.post("/user", async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        // Getting/showing users to client
        app.get("/user", async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Deleting user
        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // Find User to Update
        app.get("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result);
        })
        // Update user
        app.put("/user/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedUser = req.body;
            const user = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email
                }
            };
            const result = await userCollection.updateOne(filter, user, options);
            res.send(result);
        })

        //Doing specefic update using PATCH
        app.patch("/user", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt,
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
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