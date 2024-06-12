
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Post from '../models/Post.model.js';
import PostCategory from "../models/PostCategory.model.js";

const addPostCategory = asyncHandler(async(req,res)=>{
    const {category} = req.body;

    if(!category){
        throw new ApiError(400, "Category is required")
    }

    const existCategory = await PostCategory.findOne({category})

    if(existCategory){
        throw new ApiError(404, "Category already exist")
    }

    const newPostCategory = await PostCategory.create({
        category
    })

 //   return res
  return res
  .status(201)
  .json(new ApiResponse(201, newPostCategory, "Category added successfully"));

})
const getPostCategory = asyncHandler(async (req, res) => {
    // Ensure to use await to fetch the categories
    const categories = await PostCategory.find();
  
    // Check if categories are fetched
    if (!categories || categories.length === 0) {
      throw new ApiError(404, "Categories not found");
    }
  
    // Return the fetched categories
    return res
      .status(200)
      .json(new ApiResponse(200, categories, "Categories found successfully"));
  });
  

const addPost = asyncHandler(async (req, res) => {
  const { title, picture, content } = req.body;

  // Validate received data
  if (!title || !picture || !content) {
    throw new ApiError(400, 'All fields are required');
  }

  // Check if the category exists
//   const existCategory = await PostCategory.find({category});
//   if (!existCategory) {
//     throw new ApiError(404, 'Category not found');
//   }

  // Create new post
  const newPost = await Post.create({
    title,
    picture,
    content,
    // category
  });

 
    //   return res
    return res
    .status(201)
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

const getAllBlogs = asyncHandler(async(req,res)=>{

   const getBlogs = await Post.find()

    if(!getBlogs || getBlogs.length === 0){
        throw new ApiError(404, "Blogs not found")
    }

    return res.status(200).json(new ApiResponse(200, getBlogs, "Blogs Found Successfully"))
})

export { addPost,addPostCategory,getPostCategory,getAllBlogs };
