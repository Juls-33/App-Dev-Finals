// Code structure or syntax was taken from mongodb api, github api, w3school, geekforgeeks, stackoverflow, chatgpt, and microsoft copilot
// Node.js with express was learned via youtube, w3school, and chatgpt. Lessons from OOP and DSA was used in server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { Stream } = require('stream');

const app = express();
const port = 3000;

app.options('*', cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'admin')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true
}))

//conencting to DB
const uri = "mongodb+srv://tiyarjiz:tiyarjiz@cluster0.8qeah.mongodb.net/tiyarjiz?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri).then(() => console.log('Connected to MongoDB')).catch(err => console.error('Could not connect to MongoDB', err));

// multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); 
  },
});
const upload = multer({ storage: storage });
//google drive api
//schema models
const dataScheme = new mongoose.Schema({
  first_name: String,
  last_name: String,
  username: String,
  password: String,
  inquiries: [{type: mongoose.Schema.Types.ObjectId, ref: 'inquiriesData'}]
});
const userInquirySchema = new mongoose.mongoose.Schema({
  first_name: String,
  last_name: String,
  mobile: String,
  email: String,
  comments: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'userData'}
});
const orderSchema = new mongoose.Schema({
  size: String,
  quantity: String,
  price: String,
  photo:{
    filename: String,
    filepath: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  notes1: String,
  first_name: String,
  last_name: String,
  email: String,
  ig_username: String,
  mobile_number: String,
  address: String,
  notes2: String,
  proof:{
    filename: String,
    filepath: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'userData'}
}, { timestamps: true });
const completedOrderSchema = new mongoose.Schema({
  size: String,
  quantity: String,
  price: String,
  photo:{
    filename: String,
    filepath: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  notes1: String,
  first_name: String,
  last_name: String,
  email: String,
  ig_username: String,
  mobile_number: String,
  address: String,
  notes2: String,
  proof:{
    filename: String,
    filepath: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  trackingNumber: String,
  delivery: String,
  proofs: {
      filename: String,
      filepath: String,
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'userData'}
}, { timestamps: true });
//name of the collection and saving new data from form.html to a new collection record
const collection = 'users';
const inquiryCollection = 'inquiries'
const orderCollection = 'orders'
const completedOrdersCollection = 'completedOrders'
const userData = mongoose.model('userData', dataScheme, collection);
const inquiriesData = mongoose.model('inquiriesData', userInquirySchema, inquiryCollection);
const orderData = mongoose.model('orderData', orderSchema, orderCollection);
const completedOrderData = mongoose.model("completedOrderData", completedOrderSchema, completedOrdersCollection);
module.exports = { userData, inquiriesData, orderCollection, completedOrderData};


//GET (serving pages) and serving data from db
// Fetch user inquiries
app.get('/user-inquiry', async (req, res) => {
  console.log('Session data:', req.session);
  if (req.session.user) {
    try {
      // Fetch user inquiries from MongoDB
      const inquiries = await inquiriesData.find({ user: req.session.user._id }).select('name email mobile inquiriesText');
      res.setHeader('Content-Type', 'application/json');
      console.log(inquiries);
      res.json(inquiries);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized: You must be logged in." });
  }
});
app.get('/all-user-inquiries', async (req, res) =>{
  try{
    const inquiries = await inquiriesData.find().populate('user', 'first_name last_name email');
    if (!inquiries || inquiries.length === 0) return res.status(404).json({ message: "No user inquiries" });
    res.json(inquiries);
  }
  catch(err){
    console.log("Failed to fetch inquiries", err);
    res.status(500).json({ error:"Failed to fetch inquiries"});
  }
});
app.get('/user-data', async (req, res) =>{
  if (req.session.user){
    try{
      const user = await userData.findOne({username: req.session.user.username}).populate('inquiries');
      res.json(user);
    }
    catch (err){
      console.log(err);
      res.send('An error occurred');
    }
  }
  else{
    res.send('You must be logged in to view your data')
  }
});
app.get("/user-orders", async (req, res) => {
  try{
    if (!req.session.user){
      return res.status(401).json({error: "User not logged in" });
    }

    const orders = await orderData.find({user: req.session.user._id});

    if (orders.length ===0){
      return res.status(404).json({ message: "No orders found for this user"});
    }
    res.json(orders);
  }
  catch (err){
    console.log("Error fetching orders", err);
    res.status(500).json({error: "An error occurred while fetching the orders"});
  }
});
app.get("/admin-orders", async (req, res) => {
  try {
    const orders = await orderData.find().populate("user", "first_name last_name email");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(orders); 
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "An error occurred while fetching orders" });
  }
})
app.get("/completed-orders", async (req, res) => {
  try {
    const completedOrders = await completedOrderData.find().populate("user", "first_name last_name email");
    if (!completedOrders || completedOrders.length === 0) {
      return res.status(404).json({ message: "No completed orders found." });
    }
    res.json(completedOrders);
  } catch (err) {
    res.status(500).json({ error: "Error in fetching orders" });
  }
});
// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname,'public','login.html'));
});
app.get('/signup', async (req,res)=>{
  res.sendFile(path.join(__dirname,'createacc.html'));
})
app.get('/admin', (req, res)=>{
  res.sendFile(path.join(__dirname, 'admin','adminHome.html'));
});
app.get('/:username', (req, res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

//POST (Getting information from website)
//Handle file upload 
app.post('/upload', upload.fields([{ name: "photo", maxCount: 1 }, { name: "proof", maxCount: 1 },]), async (req, res) =>{
  console.log("PASOK!!");
  const { height, width, quantity, amountPrice, notes1, fname, lname, email, instagram, number, address, notes2} = req.body;
  console.log(req.body);
  const size = `${height} x ${width}`;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.session.user){
    console.log("image");
    try{
      if (!req.files.photo || !req.files.proof) {
        return res.status(400).send("Both 'photo' and 'proof' are required!");
      }
      //save to mongodb
      const newOrder = new orderData({
        size: size,
        quantity: quantity,
        price:amountPrice,
        photo: {
          filename: req.files.photo[0].originalname,
          filepath: `uploads/${req.files.photo[0].filename}`,
        },
        notes1: notes1,
        first_name: fname,
        last_name: lname,
        email: email,
        ig_username: instagram,
        mobile_number: number,
        address: address,
        notes2: notes2,
        proof: {
          filename: req.files.proof[0].originalname,
          filepath: `uploads/${req.files.proof[0].filename}`,
        },
        user: req.session.user._id,
      });
      await newOrder.save();

      await userData.updateOne( 
        { _id: req.session.user._id }, 
        { $push: { orders: newOrder._id } 
      });
      console.log('Image uploaded successfully');
      res.redirect("back");
    }
    catch(err){
      console.log("engkkkk" + err);
    } 
  }
  else{
    res.send(' You must be logged in to order')
  }
});
// Handle login
app.post('/login', async (req, res) => {
  const { Email, Password } = req.body;

  try{
    const user = await userData.findOne({username: Email})
    console.log(user);
    
    if (user == null){
      if (Email === 'admin' && Password === 'adminpass') {
        req.session.user = 'admin';
        res.redirect('/admin');
      } else {
        res.send('Invalid credentials');
      }
    }
    else{
      console.log(Email == user.username);
      console.log(Password == user.password);
      if (Email === user.username && Password === user.password) {
        req.session.user = user;
        res.redirect(`/${Email}`);
      }
      else {
        res.send('Invalid credentials');
      }
    }
     
  }catch (e){
    console.log(e);
  }
});

app.post('/signup', async (req, res)=>{
  const {Firstname, Lastname, Email, Password} = req.body;
  console.log(req.body);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  try{
    const existingUser = await userData.findOne({username: Email});
    if (existingUser){
      res.send('Username already taken');
      setTimeout(() => {
        res.redirect('/signup');
      }, 3000);
    }
    else{
      const newUser = new userData({first_name: Firstname, last_name: Lastname, username: Email, password: Password});
      console.log(newUser);
      await newUser.save();
      console.log('User registered successfully');
      res.redirect('/login');
    }
  }
  catch(err){
    console.log(err);
    res.send('An error occured');
    setTimeout(() => {
      res.redirect('/signup');
    }, 1000);
  }
})

//form submission
app.post('/userdata', async (req,res)=>{
  console.log("Wassup");
  if (req.session.user){
    const {FName, LName, Num, Email, Comments} = req.body;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    console.log(req.body);
    try{
      const newInquiry = new inquiriesData({first_name: FName, last_name: LName, mobile: Num, email: Email, comments: Comments, user: req.session.user._id});
      console.log(newInquiry);
      await newInquiry.save();

      await userData.updateOne(
        {_id: req.session.user._id},
        { $push: {inquiries: newInquiry._id}}
      );
      console.log('successful submit');
    }
    catch(err){
      console.log(err);
    }
  }
  else{
    res.send('You must be logged in to submit the form');
  }
});
app.post("/completed-task", upload.single("tracking"), async (req,res)=>{
  const {trackingNumber, delivery, orderId} = req.body;
  const file = req.file;

  try{
    const orderId = orderId;
    const order = await orderData.findById(orderId);
    if(!order)return res.status(404).json({error: "Order not found"});

    const completedOrder = new completedOrderData({
      ...order.toObject(),
      trackingNumber: trackingNumber,
      deliver: delivery,
      proofs:{
        filename: req.files.originalname,
        filepath: `uploads/${req.file.filename}`
      }
    });
    await completedOrder.save();
    await orderData.findByIdAndDelete(orderId);

    res.status(200).json({message: "Order completed and is moved to Completed Orders."})
  }
  catch (err){
    console.log(err);
    res.status(500).json({error: "An error occurred"});
  }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  