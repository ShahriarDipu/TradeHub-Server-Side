const express = require('express')
const cors = require('cors')
const app =express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//mongoDb cluster connection
const uri = "mongodb+srv://assignment-10:kmaWWwwdwonRIFUb@cluster0.kt3oo09.mongodb.net/?appName=Cluster0";
//middle ware

app.use(cors())
app.use(express.json())



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/',(req,res)=>{
    res.send('smart Server is running')
})


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('assignment_10')// connect with database by name, if this name not there, automatically create
    const productCollection = db.collection('products');
    const importsCollection = db.collection('imports');





app.get('/products', async (req, res) => {
  const email = req.query.email;
  const query = email ? { email } : {};
  const products = await productCollection.find(query).sort({ createdAt: -1 }).toArray();
  res.send(products);
});





//get single Product

app.get('/products/:id', async(req,res)=>{
    const id = req.params.id;
    const findOne = {_id:new ObjectId(id)}
    const result = await productCollection.findOne(findOne)
    res.send(result)
})



//get latest-products
app.get('/latest-products', async(req,res)=>{
    const cursor=productCollection.find().sort({createdAt:-1}).limit(6)
    const result =await cursor.toArray();
    res.send(result);
})



//create product by post
   app.post('/products', async(req,res)=>{
  const newProducts = req.body;
  const result = await productCollection.insertOne(newProducts)
  res.send(result);
   })



app.patch("/products/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body; // can contain either quantity or other fields

  try {
    //  Case 1: Reduce quantity during import
    if (updateData.quantity !== undefined) {
      let quantity = parseInt(updateData.quantity);

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).send({ error: "Invalid quantity" });
      }

      // Find product
      const product = await productCollection.findOne({ _id: new ObjectId(id) });
      if (!product) {
        return res.status(404).send({ error: "Product not found" });
      }

      // Ensure enough stock
      if (product.available_quantity < quantity) {
        return res.status(400).send({ error: "Not enough stock available" });
      }

      // Decrease available_quantity
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { available_quantity: -quantity } }
      );

      const updated = await productCollection.findOne({ _id: new ObjectId(id) });
      return res.send({
        message: `Quantity reduced by ${quantity}`,
        updatedProduct: updated,
      });
    }

    // 🧠 Case 2: Update product details (title, price, etc.)
    const result = await productCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedProduct = await productCollection.findOne({ _id: new ObjectId(id) });
    res.send({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});





   //Delete Products

   app.delete('/products/:id', async(req,res)=>{

   const id =req.params.id;
   const query ={_id:new ObjectId(id)}///convert normal id into mongodb format and apply search condition to find by Id
   const result = await productCollection.deleteOne(query)//delete the matching id item by calling it in deleteone form colllection
   
    res.send(result)// send to the client side after getting response

})

//Import 

app.get("/imports", async (req, res) => {
  const email = req.query.email;
  const query = email ? { email } : {};  // ✅ filter by email if present
  const result = await importsCollection.find(query).sort({ createdAt: -1 }).toArray();
  res.send(result);
});


//Import Product
app.post("/imports", async (req, res) => {
  const importData = req.body;
  const result = await importsCollection.insertOne(importData);
  res.send(result);
});








// Delete an imported product using its ID
app.delete("/imports/:id", async (req, res) => {
  const id = req.params.id;

  // Build a query to match the document by its ObjectId
  const query = { _id: new ObjectId(id) };

  // Remove the matching import from the database
  const result = await importsCollection.deleteOne(query);

  // Send back the delete result
  res.send(result);
});


  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port,()=>{
  console.log(`smart server is running on port${port}`)
})