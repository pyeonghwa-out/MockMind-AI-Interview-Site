import mongoose from "mongoose"
import { email } from "zod/v4"
import { required } from "zod/v4-mini"
import { de } from "zod/v4/locales"

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    email:{
        type : String,
        unique : true,
        required : true 
    },
    credits:{
        type : Number,
        default : 100
    }

}, {timestamps : true})

const User = mongoose.model("User", userSchema)

export default User;