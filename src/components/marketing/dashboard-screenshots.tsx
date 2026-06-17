import { BarChart3, DollarSign, Eye, MousePointerClick, ShieldCheck, Timer } from 'lucide-react';

const screenshots = [
  {
    title: 'Advertiser command centre',
    caption: 'Budget, clicks, conversion pixel status and campaign approval in one place.',
    stats: ['4 active campaigns', '₦1,240,000 tracked spend', '2.8% conversion rate'],
  },
  {
    title: 'Publisher earnings dashboard',
    caption: 'Impressions, valid clicks, quality score, approved payments and pending payouts are visible to publishers.',
    stats: ['84,200 impressions', '1,104 valid clicks', '₦106,240 approved payout'],
  },
  {
    title: 'Admin quality review',
    caption: 'Campaign approval, publisher verification, withdrawal review and fraud monitoring.',
    stats: ['Fraud flags', 'User approvals', 'Country CPC rules'],
  },
];

export function DashboardScreenshots() {
  return (
    <section className="bg-gray-950 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Dashboard screenshots</p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Clean portals for every role</h2>
          <p className="mt-4 text-gray-400">
            The public site now shows operational dashboard previews so publishers and advertisers can see the platform is built around measurable work, not empty promises.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {screenshots.map((item) => (
            <div key={item.title} className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-950 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-500">localadnetwork.app/dashboard</span>
              </div>
              <div className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">{item.caption}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-400" />
                </div>
                <div className="grid gap-3">
                  {item.stats.map((stat, index) => (
                    <div key={stat} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Eye className="h-5 w-5 text-blue-400" />}
                        {index === 1 && <MousePointerClick className="h-5 w-5 text-green-400" />}
                        {index === 2 && <DollarSign className="h-5 w-5 text-purple-400" />}
                        <span className="text-sm font-medium text-gray-200">{stat}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-800">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${55 + index * 15}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {item.title.includes('Publisher') && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-800 bg-gray-950 p-3">
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                      <p className="mt-2 text-xs text-gray-400">Quality score</p>
                      <p className="font-bold text-white">86/100</p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-950 p-3">
                      <Timer className="h-5 w-5 text-yellow-400" />
                      <p className="mt-2 text-xs text-gray-400">Avg. time</p>
                      <p className="font-bold text-white">2m 41s</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
