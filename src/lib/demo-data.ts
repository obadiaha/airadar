// Demo data for the landing page and unauthenticated users

export interface DemoScanResult {
  llm: string;
  prompt: string;
  brandsFound: string[];
  response: string;
}

export interface DemoBrandScore {
  brand: string;
  score: number;
  mentions: number;
  total: number;
  trend: number; // % change from previous period
}

export interface DemoTrendPoint {
  date: string;
  [brand: string]: string | number;
}

const PROJECT_MANAGEMENT_BRANDS = [
  "Asana", "Monday.com", "Notion", "ClickUp", "Trello",
  "Jira", "Basecamp", "Wrike", "Smartsheet", "Todoist",
];

const CRM_BRANDS = [
  "Salesforce", "HubSpot", "Pipedrive", "Zoho CRM", "Close",
  "Freshsales", "Monday CRM", "Copper", "Insightly", "Nutshell",
];

const EMAIL_MARKETING_BRANDS = [
  "Mailchimp", "ConvertKit", "Brevo", "ActiveCampaign", "Klaviyo",
  "Constant Contact", "Drip", "AWeber", "GetResponse", "Beehiiv",
];

const CATEGORIES: Record<string, string[]> = {
  "project management tools": PROJECT_MANAGEMENT_BRANDS,
  "crm software": CRM_BRANDS,
  "email marketing platforms": EMAIL_MARKETING_BRANDS,
};

function generateDemoScans(keyword: string, brands: string[]): DemoScanResult[] {
  const prompts = [
    `What are the best ${keyword}?`,
    `Can you recommend some top ${keyword} for 2025?`,
    `What ${keyword} do experts recommend?`,
    `Compare the most popular ${keyword}`,
    `What are the leading ${keyword} in the market?`,
  ];

  const llms = ["chatgpt", "perplexity", "gemini"];
  const results: DemoScanResult[] = [];

  for (const prompt of prompts) {
    for (const llm of llms) {
      // Simulate which brands get mentioned — top brands appear more
      const mentionCount = 3 + Math.floor(Math.random() * 4);
      const shuffled = [...brands].sort(() => Math.random() - 0.3);
      const mentioned = shuffled.slice(0, mentionCount);

      results.push({
        llm,
        prompt,
        brandsFound: mentioned,
        response: `Based on current recommendations, the top ${keyword} include ${mentioned.join(", ")}...`,
      });
    }
  }

  return results;
}

export function getDemoResults(brand: string, competitors: string[], keyword: string) {
  // Normalize keyword
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Get known brands for category or use provided list
  const knownBrands = CATEGORIES[normalizedKeyword] || [];
  const allBrands = Array.from(new Set([brand, ...competitors, ...knownBrands]));

  const scans = generateDemoScans(keyword, allBrands);
  const totalPrompts = scans.length;

  // Calculate scores for primary brand and competitors
  const trackedBrands = [brand, ...competitors];
  const scores: DemoBrandScore[] = trackedBrands.map((b) => {
    const mentions = scans.filter((s) => s.brandsFound.includes(b)).length;
    const score = Math.round((mentions / totalPrompts) * 100);
    const trend = Math.round((Math.random() - 0.3) * 20);
    return { brand: b, score, mentions, total: totalPrompts, trend };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Generate trend data (last 8 weeks)
  const trends: DemoTrendPoint[] = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const point: DemoTrendPoint = {
      date: date.toISOString().split("T")[0],
    };
    for (const b of trackedBrands) {
      const baseScore = scores.find((s) => s.brand === b)?.score || 30;
      point[b] = Math.max(0, Math.min(100, baseScore + Math.round((Math.random() - 0.5) * 20)));
    }
    trends.push(point);
  }

  // Per-LLM breakdown
  const llmBreakdown = ["chatgpt", "perplexity", "gemini"].map((llm) => {
    const llmScans = scans.filter((s) => s.llm === llm);
    const brandMentions = llmScans.filter((s) => s.brandsFound.includes(brand)).length;
    return {
      llm,
      score: Math.round((brandMentions / llmScans.length) * 100),
      mentions: brandMentions,
      total: llmScans.length,
    };
  });

  return { scores, trends, llmBreakdown, scans, keyword };
}
