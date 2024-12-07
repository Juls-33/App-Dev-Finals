//Code structure and syntax are taken from stackoverflow, MongoDB API, geekforgeeks, GoogleAPI, chatgpt, and Microsoft Copilot

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
// const streamifier = require('streamifier');
// const { google } = require('googleapis');
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
    cb(null, "uploads/"); // Specify the upload folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Generate unique file name
  },
});
const upload = multer({ storage: storage });
//google drive api
/*
const CLIENT_ID= "82931729345-03e5gn9ag24tqb83865v2h71r08rh09g.apps.googleusercontent.com";
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost';
const REFRESH_TOKEN = "https://oauth2.googleapis.com/token";
const oauth2Client = new google.auth.OAuth2('82931729345-03e5gn9ag24tqb83865v2h71r08rh09g.apps.googleusercontent.com', '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', 'http://localhost:3000/oauth2callback');
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive'],
  prompt: 'consent',
});*/
/*
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const { client_id, client_secret, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Save tokens to use later
  fs.writeFileSync('tokens.json', JSON.stringify(tokens));
  res.send('Authentication successful! You can now upload files.');
});
if (fs.existsSync('tokens.json')) {
  const tokens = JSON.parse(fs.readFileSync('tokens.json'));
  oAuth2Client.setCredentials(tokens);
}

// const drive = google.drive({version: 'v3', auth: oauth2Client})
// oauth2Client.refreshAccessToken((err, tokens) => { 
//   if (err) { 
//     console.error('Error refreshing access token:', err); 
//     return; 
//   } 
//   console.log('Access token refreshed:', tokens); });
*/
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
})

//name of the collection and saving new data from form.html to a new collection record
const collection = 'users';
const inquiryCollection = 'inquiries'
const orderCollection = 'orders'
const userData = mongoose.model('userData', dataScheme, collection);
const inquiriesData = mongoose.model('inquiriesData', userInquirySchema, inquiryCollection);
const orderData = mongoose.model('orderData', orderSchema, orderCollection);
module.exports = { userData, inquiriesData, orderCollection};


//GET (serving pages)
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
  const { sizes, notes1, fname, lname, email, instagram, number, address, notes2} = req.body;
  console.log(req.body);
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
        size: sizes,
        photo: {
          filename: req.files.photo[0].originalname,
          filepath: req.files.photo[0].path,
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
          filepath: req.files.proof[0].path,
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
    console.log(Email == user.username);
    console.log(Password == user.password);
    
    if (Email == user.username && Password == user.password) {
      req.session.user = user;
      res.redirect(`/${Email}`);
    } else if (Email === 'admin' && Password === 'adminpass') {
      req.session.user = 'admin';
      res.redirect('/admin');
    } else {
      res.send('Invalid credentials');
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  