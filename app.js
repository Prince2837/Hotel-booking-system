//prince
if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
};



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const methodOverride = require("method-override");
const engine = require("ejs-mate"); 
// const { error } = require("console");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const wrapAsync = require("./utils/wrapAsync.js")

const dburl = process.env.ATLASH_TOKEN;

main()
.then(()=>{
    console.log("Connection succesfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);

}


app.set("views",path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', engine);

const store = MongoStore.create({
   mongoUrl:dburl,
   crypto:{
    secret:process.env.SECERT
   },
   touchAfter:24*3600,
})
store.on("error" ,()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
  
})

const sessionOptions = {
  store,
  secret: process.env.SECERT,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  },
};


app.get("/",(req,res)=>{
    res.send("Root is working");
});



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;

  // Make categories available in all views
  res.locals.categories = [
    "Beach", "Mountain", "Village", "City", "Desert", 
  "Lakefront", "Cabin", "Camping", "Treehouse", "Ski", 
  "Igloo", "Castle", "Luxe", "Windmill", "Forest", "Cave"
  ];

  // Ensure these are always defined to avoid EJS errors
  res.locals.category = "";
  res.locals.q = "";

  next();
});





app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);





// 404 handler
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found"));
// });

// ✅ Error-handling middleware (this catches ExpressError and all other errors)
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.render("users/error", { err });
});

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});

// if(process.env.NODE_ENV != "production"){
// require('dotenv').config()
// }






// main()
// .then(()=>{
//     console.log("Connection succesfull");
// })
// .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
// }

// app.set("views",path.join(__dirname, "views"));
// app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.urlencoded({extended : true}));
// app.use(methodOverride("_method"));
// app.engine('ejs', engine);

// const sessionOptions = {
//   secret: "mysecreatcode",
//   resave: false,
//   saveUninitialized: true, 
//   cookie:{
//     expires: Date.now() + 7*24*60*60*1000,
//     maxAge: 7*24*60*60*1000,
//     httpOnly: true,
//   },
// };

// app.use(session(sessionOptions));
// app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currentUser = req.user;

//   // Make categories available in all views
//   res.locals.categories = [
//     "Beach", "Mountain", "Village", "City", "Desert", 
//   "Lakefront", "Cabin", "Camping", "Treehouse", "Ski", 
//   "Igloo", "Castle", "Luxe", "Windmill", "Forest", "Cave"
//   ];

//   // Ensure these are always defined to avoid EJS errors
//   res.locals.category = "";
//   res.locals.q = "";
//  next();
// });
// app.get("/",(req,res)=>{
//     res.redirect("/listings"); // ✅ Redirect to listings instead of just showing text
// });

// app.use("/listings", listings);
// app.use("/listings/:id/reviews", reviews); // ✅ Commented out since reviews.js doesn't exist
// app.use("/", user);

// // Error handling middleware
// // Error handling middleware
// app.use((err, req, res, next) => {
//     const status = err.status || 500;
//     const message = err.message || 'Something went wrong!';
    
//     // For development - show full error
//     if (process.env.NODE_ENV === 'development') {
//         res.status(status).json({
//             error: {
//                 message: message,
//                 status: status,
//                 stack: err.stack
//             }
//         });
//     } else {
//         // For production - hide sensitive info
//         res.status(status).json({
//             error: {
//                 message: status === 500 ? 'Internal Server Error' : message,
//                 status: status
//             }
//         });
//     }
// });


// app.listen(8080, ()=>{
//     console.log("Server is listening to port 8080");
// });



 