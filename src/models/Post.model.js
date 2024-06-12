import mongoose, {Schema} from "mongoose";

const postSchema = new Schema ({
    title:{
        type: String, 
        required:true
    },
    picture: {
        type: String, // url
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      // category: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: 'PostCategory',
      //   required: true,
      // },
      createdAt: {
        type: Date,
        default: Date.now,
      },

},{timestamps:true})


const Post = mongoose.model("Post", postSchema)

export default Post