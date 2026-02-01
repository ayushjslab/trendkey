import React from 'react';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/blog';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
    title: 'Blogs | Trenkey',
    description: 'Explore the latest trends, insights, and stories from the digital world.',
};

const BlogsListPage = async () => {
    await connectDB();
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    console.log(blogs)

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans selection:bg-purple-500/30 overflow-x-hidden">
            {/* Background Decorative Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
                {/* Header section */}
                <header className="mb-20 text-center flex flex-col items-center">
                    <div className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Our Journal</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 italic bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">
                        The Feed
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl font-medium">
                        Deep dives into technology, culture, and the future of human connection.
                    </p>
                </header>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <Link key={blog._id.toString()} href={`/blogs/${blog.slug}`} className="group relative">
                            <article className="h-full flex flex-col bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden transition-all duration-500 hover:border-purple-500/50 hover:bg-white/[0.08] hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        src={blog.thumbnail}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-60" />

                                    {/* Reading Time Badge */}
                                    <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-[#050505]/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 backdrop-saturate-150">
                                        <Clock className="w-3 h-3 text-purple-400" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                            {Math.ceil((blog.content || "").split(/\s+/).length / 200)} min
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-4 text-[10px] font-bold uppercase tracking-widest text-purple-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-black mb-4 leading-tight group-hover:text-white transition-colors">
                                        {blog.title}
                                    </h2>

                                    <p className="text-gray-500 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                                        {blog.seoDescription}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                        <div className="flex -space-x-2">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border border-[#050505] bg-purple-600 flex items-center justify-center text-[8px] font-bold">
                                                    {i === 1 ? 'A' : 'T'}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                                            Read More
                                            <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {blogs.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <p className="text-sm uppercase tracking-widest font-bold">No blogs found yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogsListPage;