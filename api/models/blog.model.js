import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    blogContent: {
        type: String,
        required: true,
        trim: true
    },
    featuredImage: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },

    deathDate: { 
        type: Date, 
        required: false 
    },
    placeOfDeath: {
        type: String,
        required: false
    },
    deathMethod: {
        type: String,
        required: true
    }
   
}, { timestamps: true })

const Blog = mongoose.model('Blog', blogSchema, 'blogs')
export default Blog 