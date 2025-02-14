const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { title } = require("process");
const PORT = process.env.PORT || 5006;
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");




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

const validateListing  = (req,res,next) =>{
  let {error} =  listingSchema.validate(req.body);
  // console.log(result);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
};

const validateReview  = (req,res,next) =>{
  let {error} =  reviewSchema.validate(req.body);
  // console.log(result);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
};




// index Routes
app.get("/listings",(async (req, res) => {
  const allListings = await Listing.find({});
  
  res.render("listings/index.ejs", { allListings });
}));


//  new and create routes
app.get("/listings/new",wrapAsync(async (req, res) => {
  res.render("listings/new.ejs");
}));

// show detail rotues
app.get("/listings/:id",wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

// create routes
app.post("/listings",wrapAsync(async(req, res, next) => {
   
    const { title, description, url, price, location, country } = req.body;
    const ob = {
      title: title,
      description: description,
      image: {
        filename: String,
        url: url,
      },
      price: price,
      location: location,
      country: country,
    };
    const newListing = new Listing(ob);
    await newListing.save();
    res.redirect("/listings");
}));



// edit rotues
app.get("/listings/:id/edit",wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));


// update routes
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
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
}));

// delete routes
app.delete("/listings/:id",wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedList = await Listing.findByIdAndDelete(id);
  // console.log(deletedList);
  res.redirect("/listings");
}));

// Review post routes
app.post("/listings/:id/reviews", validateReview,wrapAsync( async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

 await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);

}));

// delete routes for revirews
app.delete("/listings/:id/reviews/:reviewId", 
   wrapAsync(async (req, res) => {
       let { id, reviewId } = req.params;
       await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
       await Review.findByIdAndDelete(reviewId);
       res.redirect(`/listings/${id}`);
}));



// reviews post routes
// app.post("/listings/:id/reviews", async(req,res)=>{
//   let listing = await Listing.findById(req.params.id);
//   let newReview = new Review(req.body.review);

//   listing.reviews.push(newReview);
  
//   await newReview.save();
//   await listing.save();

//   console.log("review is saved");
//   res.send("new Review saved");
// });

// app.post("/:showId",async(req,res)=>{
//   try{
//   const {comment, rating}  = req.body;
//   const {showId} = req.params;
//   // convertin rating to a numebr and validate
//     const numericRating = Number(rating);
//     if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
//       return res.status(400).send("Invalid rating. Must be a number between 1 and 5.");
//     }
  
//   const newReview = new Review({
//     showId,
//     userId: "65abc1234567890", // Replace with actual user ID from session/authentication
//     comment,
//     rating: numericRating
//   });
//   await newReview.save();
//   res.redirect(`/shows/${showId}`); // Redirect back to show page
// } catch (error) {
//   console.error("Error adding review:", error);
//   res.status(500).send("Error submitting review.");
// }
// });

app.all("*",(req,res,next)=>{
  next(new ExpressError(404, "page not found"));
});



// create middleware
app.use((err, req, res, next)=>{
  let {statusCode=500, message="something went wrong"} = err;
  
  res.status(statusCode).render("error.ejs", {err});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
