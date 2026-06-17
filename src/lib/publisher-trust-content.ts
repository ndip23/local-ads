export const publisherMission = {
  headline: 'Local Ad Network exists to help quality publishers earn fairly from trusted local attention.',
  body: 'The network connects advertisers who need measurable local outcomes with publishers who have real audiences, niche credibility and clean traffic. The platform is publisher-first because the network only becomes valuable when honest publishers are protected, paid transparently and given the information they need to improve.',
  promise: 'Transparency before scale. Quality before volume. Publishers before black-box advertising.',
};

export const paymentPolicy = {
  threshold: '₦25,000 minimum approved balance',
  schedule: 'Payout requests open every Monday and are processed within 3 to 5 working days after approval.',
  methods: ['Nigerian bank transfer', 'Business account transfer for registered publishers', 'Manual finance review for exceptional settlement cases'],
  rules: [
    'Only approved earnings can be withdrawn. Pending earnings stay locked until traffic quality review is complete.',
    'Publisher earnings are calculated from qualified clicks and eligible conversion bonuses, not raw click volume.',
    'The default revenue split is 80% publisher share and 20% platform operating share unless a special contract says otherwise.',
    'Withdrawals may be paused if fraud signals, traffic manipulation, invalid placements or unresolved disputes are detected.',
    'Every payout must show opening balance, approved earnings, rejected earnings, withdrawal amount and closing balance.',
  ],
};

export const publisherMetrics = [
  { label: 'Impressions', description: 'How many times approved ad placements were displayed.' },
  { label: 'Clicks', description: 'How many users clicked publisher placements.' },
  { label: 'Valid clicks', description: 'Clicks that passed quality and fraud filters.' },
  { label: 'Estimated earnings', description: 'Projected earnings before quality review is completed.' },
  { label: 'Pending payments', description: 'Earnings waiting for approval, dispute review or payout window.' },
  { label: 'Approved payments', description: 'Earnings cleared for withdrawal.' },
  { label: 'Rejected activity', description: 'Invalid clicks or impressions removed from payable activity.' },
  { label: 'Engagement', description: 'Time on site, pages viewed and bounce-quality signals where available.' },
];

export const qualityScoreWeights = [
  { factor: 'Valid click rate', weight: '25%', description: 'Percentage of clicks that pass fraud, repeat-click and traffic source checks.' },
  { factor: 'Engagement depth', weight: '20%', description: 'Time on site, pages viewed and whether users behave like real readers.' },
  { factor: 'Niche relevance', weight: '20%', description: 'How closely publisher content matches advertiser category and campaign intent.' },
  { factor: 'Traffic source quality', weight: '15%', description: 'Direct, organic, newsletter and community traffic score higher than suspicious spikes.' },
  { factor: 'Placement integrity', weight: '10%', description: 'Ads must be visible, non-deceptive and not hidden behind forced clicks.' },
  { factor: 'Dispute history', weight: '10%', description: 'Repeated advertiser complaints or invalid activity reduce the score.' },
];

export const publisherTiers = [
  { name: 'Bronze', score: '50 to 64', benefits: ['Basic campaign access', 'Standard review cycle', 'Monthly quality tips'] },
  { name: 'Silver', score: '65 to 79', benefits: ['More campaign eligibility', 'Faster site review', 'Priority support queue'] },
  { name: 'Gold', score: '80 to 89', benefits: ['Premium campaign access', 'Higher visibility to advertisers', 'Early feature access'] },
  { name: 'Platinum', score: '90 to 100', benefits: ['Founding publisher priority', 'Best campaign matching', 'Dedicated account review'] },
];

export const fraudGuidelines = [
  'Do not click your own ads or ask friends, staff or groups to click ads artificially.',
  'Do not use bots, click farms, traffic exchanges, forced redirects, pop-under traps or incentivised click schemes.',
  'Do not hide ads, disguise ads as navigation buttons or place ads where accidental clicks are likely.',
  'Do not buy low-quality traffic for pages carrying Local Ad Network placements.',
  'Do not edit tracking links, iframe codes, widgets or campaign destinations in a way that hides traffic source data.',
  'Do not publish restricted, misleading, copied, hateful, adult, illegal or unsafe content around advertiser placements.',
];

export const publisherNiches = [
  {
    slug: 'real-estate',
    title: 'Real Estate Publishers',
    description: 'For property blogs, listing directories, agents, estate communities and property investment platforms.',
    advertisers: ['Developers', 'Estate agents', 'Surveyors', 'Mortgage advisers', 'Interior and furnishing brands'],
    metrics: ['Property enquiry clicks', 'Location-based engagement', 'Lead form conversions', 'Repeat visitor quality'],
  },
  {
    slug: 'construction',
    title: 'Construction Publishers',
    description: 'For building material blogs, contractor directories, architecture pages and construction industry media.',
    advertisers: ['Cement and building suppliers', 'Equipment vendors', 'Contractors', 'Architects', 'Facility managers'],
    metrics: ['Supplier enquiry clicks', 'Project-intent traffic', 'Guide/article engagement', 'Quote request conversions'],
  },
  {
    slug: 'business-directory',
    title: 'Business Directory Publishers',
    description: 'For directories, city guides, B2B listing sites and professional service discovery platforms.',
    advertisers: ['SMEs', 'Professional services', 'Local shops', 'Training providers', 'B2B service brands'],
    metrics: ['Category intent', 'Search-to-click behaviour', 'Listing page engagement', 'CTA conversion quality'],
  },
  {
    slug: 'hotels',
    title: 'Hotel and Hospitality Publishers',
    description: 'For hotel guides, travel pages, venue directories, tourism media and hospitality communities.',
    advertisers: ['Hotels', 'Short-let operators', 'Restaurants', 'Event centres', 'Travel services'],
    metrics: ['Booking intent clicks', 'Location interest', 'Time on hotel pages', 'Call and enquiry actions'],
  },
  {
    slug: 'news',
    title: 'News and Community Publishers',
    description: 'For local newsrooms, community blogs, civic platforms and niche information sites.',
    advertisers: ['Public campaigns', 'Events', 'Education providers', 'Local services', 'Consumer brands'],
    metrics: ['Reader engagement', 'Article placement performance', 'Newsletter traffic', 'Content relevance score'],
  },
];

export const roadmapItems = [
  { quarter: 'Phase 1', title: 'Trust foundation', details: 'Publisher qualification, visible policies, payment transparency, quality scoring and founding publisher onboarding.' },
  { quarter: 'Phase 2', title: 'Dashboard depth', details: 'Publisher metrics, engagement tracking, improved reporting, earnings formula display and recommendations.' },
  { quarter: 'Phase 3', title: 'Quality-led growth', details: 'Publisher tiers, niche-specific campaign matching, fraud review improvements and advertiser quality controls.' },
  { quarter: 'Phase 4', title: 'Scale carefully', details: 'First 20 to 50 quality publishers, partner network expansion, public case studies and automated communication loops.' },
];

export const faqItems = [
  { question: 'How do publishers earn?', answer: 'Publishers earn from qualified clicks and eligible conversion bonuses generated through approved placements. Raw clicks are reviewed before they become approved earnings.' },
  { question: 'When can I withdraw?', answer: 'You can request withdrawal after your approved balance reaches the published payout threshold and your account has no unresolved quality or fraud review.' },
  { question: 'Why are some clicks rejected?', answer: 'Clicks can be rejected for repeat activity, bot-like behaviour, suspicious source patterns, accidental placements, forced clicks or policy violations.' },
  { question: 'Can small publishers join?', answer: 'Yes, but quality matters more than size. A focused niche audience with clean traffic is more valuable than inflated low-quality volume.' },
  { question: 'What is the Founding Publisher Program?', answer: 'It is an early adopter programme for the first serious publishers who help shape the platform, test policies and prove the quality-first model.' },
];
