import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postCategorySchema = new Schema ({
    category:{
        type: String, 
        required:true
    },
         createdAt: {
        type: Date,
        default: Date.now,
      },

},{timestamps:true})

// postSchema.plugin(mongooseAggregatePaginate)

const PostCategory = mongoose.model("PostCategory", postCategorySchema)

export default PostCategory