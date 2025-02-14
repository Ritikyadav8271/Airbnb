const mongoose = require("mongoose");

const Schema  = mongoose.Schema;
const Review = require("./reviews.js");

const listingSchema = new Schema({
    title:{
        type: String,
        required:true,
    },
    description:{
        type: String,
        required:true,
    },
    image:{
        fileName:String,
        url:{
            type: String,
            default: "https://images.unsplash.com/photo-1737100593814-8ceb04f29cca?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            set:(v) => 
                v === ""
                ?"https://images.unsplash.com/photo-1737100593814-8ceb04f29cca?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D": v,
        }
    },
    price: {
        type: Number,
        required: true,

    },
    location: {
        type: String,
        required: true,
    },
    country:{
        type: String,
        required: true,
    },
    reviews:[
        {
          type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in:listing.reviews}});
    }
});

const Listing = mongoose.model("Listings", listingSchema);
module.exports = Listing;