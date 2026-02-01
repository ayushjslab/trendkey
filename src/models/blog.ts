import mongoose, { models } from "mongoose";

const blogSchema = new mongoose.Schema({
    blogId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    seoTitle: {
        type: String,
        required: true
    },
    seoDescription: {
        type: String,
        required: true
    },
    keywords: [
        {
            name: { type: String },
            volume: { type: Number },
        }
    ],
}, { timestamps: true })

const Blog = models.Blog || mongoose.model("Blog", blogSchema)

export default Blog
