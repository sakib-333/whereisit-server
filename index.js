const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());

// Port
const port = process.env.PORT || 3000;

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.ph_b10_a11;

  if (!token) {
    return res.status(403).send({ message: "Unauthorized access" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Unauthorized access" });
      }
      req.decodedEmail = decoded.email;
      next();
    });
  }
};

const checkVaildUser = (req, res, next) => {
  const { email } = req.body;

  if (email !== req.decodedEmail) {
    return res.status(403).send({ message: "Unauthorized access" });
  }
  next();
};

const uri = `mongodb+srv://${db_username}:${db_password}@cluster0.ashqk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("ph_b10_a11_db");
    const lostAndFoundItemCollections = database.collection(
      "lostAndFoundItemCollections"
    );

    // Auth APIs
    app.post("/jwt", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("ph_b10_a11", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.send({ acknowledgement: true, status: "cookie created" });
    });

    // Logout
    app.post("/logout", (req, res) => {
      res.clearCookie("ph_b10_a11", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.send({ acknowledgement: true, status: "cookie cleared" });
    });

    // Get all items
    app.get("/allItems", async (req, res) => {
      const cursor = lostAndFoundItemCollections.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // Get single item
    app.post("/items/:id", verifyToken, async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const options = {};
      const item = await lostAndFoundItemCollections.findOne(query, options);

      res.send(item);
    });

    // Get all of my items
    app.post("/myItems", verifyToken, checkVaildUser, async (req, res) => {
      const query = req.body;
      const options = {};
      const cursor = lostAndFoundItemCollections.find(query, options);
      const result = await cursor.toArray();

      res.send(result);
    });

    // Add items
    app.post("/addItems", verifyToken, checkVaildUser, async (req, res) => {
      const { newItem } = req.body;
      const { date, ...rest } = newItem;
      const parsedDate = new Date(date);
      const truncatedDate = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      );

      const updatedItem = {
        ...rest,
        date: truncatedDate,
      };

      const result = await lostAndFoundItemCollections.insertOne(updatedItem);
      res.send(result);
    });

    // Update item
    app.post(
      "/updateItems/:id",
      verifyToken,
      checkVaildUser,
      async (req, res) => {
        const { id } = req.params;
        const { newItem } = req.body;
        const { date, ...rest } = newItem;
        const parsedDate = new Date(date);
        const truncatedDate = new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        );

        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedItem = {
          ...rest,
          date: truncatedDate,
        };
        const updateDoc = {
          $set: updatedItem,
        };
        const result = await lostAndFoundItemCollections.updateOne(
          filter,
          updateDoc,
          options
        );

        res.send(result);
      }
    );

    // Delete item
    app.post(
      "/deleteItem/:id",
      verifyToken,
      checkVaildUser,
      async (req, res) => {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await lostAndFoundItemCollections.deleteOne(query);

        res.send(result);
      }
    );

    // Get latest six items
    app.post("/latestItems", async (req, res) => {
      const cursor = lostAndFoundItemCollections
        .find()
        .sort({ date: -1 })
        .limit(6);
      const result = await cursor.toArray();

      res.send(result);
    });

    // Search
    app.post("/search", async (req, res) => {
      const { key } = req.body;
      const query = {
        $or: [
          { title: { $regex: key, $options: "i" } },
          { location: { $regex: key, $options: "i" } },
        ],
      };
      const cursor = lostAndFoundItemCollections.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Public APIs
app.get("/", (req, res) => {
  res.send("<h1>Welcome</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
