const mongoose = require("mongoose");
const data = require("./data");
const Listing = require("../models/listings");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Airbnb")
}
main()
    .then(()=>{
        console.log("connnected to db");
}).catch((err) => {
    console.log(err);
})

const initDb = async() =>{
    await Listing.deleteMany({});
    await Listing.insertMany(data);
    console.log("data was initialized");

};
initDb();

