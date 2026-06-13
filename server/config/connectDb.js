import mongoose from "mongoose"

const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database Connected");
    } catch(error){
        console.log(`Databse Error ${error}`);
    }
}

export default connectDb