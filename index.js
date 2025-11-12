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



    


///Get all Products
app.get('/products', async(req,res)=>{

    const email = req.query.email;

    const query={} ///if there is email set a property value of email

        if (email){
            query.email= email
        }
    

    const findAll = productCollection.find(query);
    const result = await findAll.toArray();
    res.send(result)
})

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


//update products
  app.patch('/products/:id' , async(req,res)=>{
     const id = req.params.id;
     const updatedNewProduct= req.body;// storing the changed data by client in a variable
     const findMatchId = {_id:new ObjectId(id)}


 const setUpdate ={
//    $set:updatedNewProduct. // update full file or
  $set:{
    name:updatedNewProduct.name,
    price:updatedNewProduct.price,
    color:updatedNewProduct.color,
  }

 }

const result = await productCollection.updateOne(findMatchId, setUpdate)
res.send(result)


  })


   //Delete Products

   app.delete('/products/:id', async(req,res)=>{

   const id =req.params.id;
   const query ={_id:new ObjectId(id)}///convert normal id into mongodb format and apply search condition to find by Id
   const result = await productCollection.deleteOne(query)//delete the matching id item by calling it in deleteone form colllection
   
    res.send(result)// send to the client side after getting response

})


app.get("/imports", async (req, res) => {
  const result = await importsCollection.find().toArray();
  res.send(result);
});


//Import Product
app.post("/imports", async (req, res) => {
  const importData = req.body;
  const result = await importsCollection.insertOne(importData);
  res.send(result);
});

//Add a path to reduce quantity
app.patch("/products/:id", async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  const result = await productCollection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { available_quantity: -quantity } } // reduce quantity
  );
  res.send(result);
});

// Delete import product by ID
app.delete("/imports/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await importsCollection.deleteOne(query);
  res.send(result);
});


  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port,()=>{
  console.log(`smart server is running on port${port}`)
})