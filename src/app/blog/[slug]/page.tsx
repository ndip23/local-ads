import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { blogPosts } from '@/lib/marketing-content';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  return {
    title: post ? `${post.title} | Local Ads Blog` : 'Blog Article | Local Ads',
    description: post?.excerpt || 'Local Ads blog article.',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <article className="container mx-auto px-6 py-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
        <div className="mx-auto mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">{post.category}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-6xl">{post.title}</h1>
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4" />
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <div className="mt-10 space-y-7 text-lg leading-8 text-gray-300">
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-12 rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <h2 className="text-2xl font-bold text-white">Put this into action</h2>
            <p className="mt-3 text-gray-400">Use the Local Ads campaign builder to apply the article lesson through targeting, CTA choice, media upload and conversion tracking.</p>
            <Link href="/register" className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Create account
            </Link>
          </div>
        </div>
      </article>
      <MarketingFooter />
    </main>
  );
}
