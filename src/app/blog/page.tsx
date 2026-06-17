import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { blogPosts } from '@/lib/marketing-content';

export const metadata = {
  title: 'Blog | Local Ads',
  description: 'Local Ads blog articles for advertisers, publishers and performance-focused local marketing teams.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Blog</p>
        <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">Local Ads insights</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Practical articles for advertisers who need better campaign discipline and publishers who want to earn without damaging audience trust.
        </p>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-20 md:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.slug} className="rounded-3xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-blue-500/60">
            <p className="text-sm font-semibold text-blue-400">{post.category}</p>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-white">{post.title}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <p className="mt-4 leading-7 text-gray-400">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-8 inline-flex items-center gap-2 font-semibold text-blue-300 hover:text-blue-200">
              Read article <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>
      <MarketingFooter />
    </main>
  );
}
