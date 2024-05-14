const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_KEY}@cluster0.fp5eepf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const foodDatabase = client.db("foodDB");
    const foodCollection = foodDatabase.collection("food");
    const requestedFoodCollection = foodDatabase.collection("requestedFood");

    app.get("/allAvailableFoods", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/sixFood", async (req, res) => {
      const cursor = foodCollection.find().sort({ foodQuantity: -1 }).limit(6);
      try {
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching food items:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/requestedFood/:email", async (req, res) => {
      const result = await requestedFoodCollection
        .find({ requestedUserEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.post("/food", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    app.post("/requestedFood", async (req, res) => {
      const requestedFood = req.body;
      console.log(requestedFood);
      const result = await requestedFoodCollection.insertOne(requestedFood);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food Fare server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
