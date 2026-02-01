import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MoveLeft, Calendar, User, Tag, Clock } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    await connectDB();
    const blog = await Blog.findOne({ slug });

    if (!blog) {
        return {
            title: "Blog Not Found",
        };
    }

    return {
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription,
        keywords: blog.keywords?.map((k: any) => k.name).join(", "),
        openGraph: {
            title: blog.title,
            description: blog.seoDescription,
            images: [blog.thumbnail],
        },
    };
}

const BlogPage = async ({ params }: PageProps) => {
    const { slug } = await params;
    await connectDB();
    const blog = await Blog.findOne({ slug });

    if (!blog) {
        notFound();
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = blog.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans selection:bg-purple-500/30">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
            </div>

            <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#050505]/80">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
                    >
                        <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Reading Mode</span>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-32">
                {/* Header Section */}
                <header className="mb-16">
                    {blog.thumbnail && (
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10 group">
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric"
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            {readingTime} min read
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-500" />
                            Admin
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap gap-2">
                        {blog.keywords?.map((kw: any, i: number) => (
                            <span
                                key={i}
                                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:border-purple-500/50 transition-colors"
                            >
                                #{kw.name}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Content Section */}
                <article className="prose prose-invert prose-purple max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-400 prose-p:leading-relaxed prose-li:text-gray-400 prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-img:rounded-3xl prose-img:border prose-img:border-white/10">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-4xl font-black mb-8 pt-8 border-t border-white/5" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mb-6 pt-6" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mb-4" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-6 text-lg leading-relaxed text-gray-300/90" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
                            li: ({ node, ...props }) => <li className="text-gray-300/90" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-purple-500 bg-purple-500/5 px-6 py-4 italic my-8 rounded-r-2xl text-xl text-purple-200/90" {...props} />
                            ),
                            code: ({ node, ...props }) => (
                                <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-sm text-purple-300" {...props} />
                            ),
                            pre: ({ node, ...props }) => (
                                <pre className="bg-[#111] border border-white/10 p-6 rounded-3xl overflow-x-auto my-8 scrollbar-hide" {...props} />
                            ),
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                    <table className="w-full text-left border-collapse" {...props} />
                                </div>
                            ),
                            th: ({ node, ...props }) => <th className="p-4 border-b border-white/10 font-bold text-white bg-white/5" {...props} />,
                            td: ({ node, ...props }) => <td className="p-4 border-b border-white/5 text-gray-400" {...props} />,
                            hr: ({ node, ...props }) => <hr className="my-12 border-white/5" {...props} />,
                            a: ({ node, ...props }) => <a className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors" {...props} />,
                            iframe: ({ node, ...props }) => (
                                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 my-10 shadow-2xl">
                                    <iframe className="absolute inset-0 w-full h-full" {...props} />
                                </div>
                            ),
                        }}
                    >
                        {blog.content}
                    </ReactMarkdown>
                </article>

                {/* Footer info */}
                <footer className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-purple-600 to-blue-600 p-0.5">
                            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center font-black text-xl italic">
                                T
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-white">Trenkey Insights</p>
                            <p className="text-xs text-gray-500">Exploring the pulse of the digital world.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" />
                        ))}
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default BlogPage;
