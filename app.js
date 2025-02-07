const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { title } = require("process");
const wrapAsync = require("./utils/wrapAsync");
const PORT = process.env.PORT || 5006;
const wrapAsyncc = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Airbnb");
}
main()
  .then(() => {
    console.log("connnected to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello! Ritik");
});
// index Routes
app.get("/listings",async (req, res) => {
  const allListings = await Listing.find({});
  // console.log(allListings);
  res.render("listings/index.ejs", { allListings });
});

//  new and create routes
app.get("/listings/new",async (req, res) => {
  res.render("listings/new.ejs");
});

// show detail rotues
app.get("/listings/:id",wrapAsyncc( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

// create toutes
app.post("/listings",async(req, res, next) => {
  
    const { title, description, url, price, location, country } = req.body;
  const ob = {
    title: title,
    description: description,
    image: {
      url: url,
    },
    price: price,
    location: location,
    country: country,
  };
  const newListing = new Listing(ob);
  console.log(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  
  
});

// edit rotues
app.get("/listings/:id/edit",async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});
//
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const { title, description, url, price, location, country } = req.body;
  const ob = {
    title: title,
    description: description,
    image: {
      url: url,
    },
    price: price,
    location: location,
    country: country,
  };
  await Listing.findByIdAndUpdate(id, ob);
  res.redirect(`/listings/${id}`);
});

// delet routes
app.delete("/listings/:id",async (req, res) => {
  let { id } = req.params;
  let deletedList = await Listing.findByIdAndDelete(id);
  // console.log(deletedList);
  res.redirect("/listings");
});

app.all("*",(req,res,next)=>{
  next(new ExpressError(404, "page not found"));
});



// create middleware
app.use((err, req, res, next)=>{
  let {statusCode=500, message="something went wrong"} = err;
  res.status(statusCode).send(message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
