import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // jo user subscribe krega
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //jis user ka channel hai
        ref:"User"
    },
},{
    timestamps:true
})

const Subscription = mongoose.model("Subscription",subscriptionSchema)