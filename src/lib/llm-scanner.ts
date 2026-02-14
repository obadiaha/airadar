import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface ScanResult {
  llm: string;
  prompt: string;
  response: string;
  brandsFound: string[];
}

// Generate category-relevant prompts
export function generatePrompts(keyword: string): string[] {
  return [
    `What are the best ${keyword}?`,
    `Can you recommend some top ${keyword} for 2025?`,
    `What ${keyword} do experts recommend?`,
    `Compare the most popular ${keyword}`,
    `What are the leading ${keyword} in the market?`,
  ];
}

// Query ChatGPT and parse response for brand mentions
export async function scanChatGPT(
  prompt: string,
  brands: string[]
): Promise<ScanResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "";
    const brandsFound = findBrands(response, brands);

    return { llm: "chatgpt", prompt, response, brandsFound };
  } catch (error) {
    console.error("ChatGPT scan error:", error);
    return { llm: "chatgpt", prompt, response: "Error querying ChatGPT", brandsFound: [] };
  }
}

// Query Perplexity API
export async function scanPerplexity(
  prompt: string,
  brands: string[]
): Promise<ScanResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return { llm: "perplexity", prompt, response: "Perplexity API key not configured", brandsFound: [] };
  }

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || "";
    const brandsFound = findBrands(response, brands);

    return { llm: "perplexity", prompt, response, brandsFound };
  } catch (error) {
    console.error("Perplexity scan error:", error);
    return { llm: "perplexity", prompt, response: "Error querying Perplexity", brandsFound: [] };
  }
}

// Query Gemini via OpenAI-compatible endpoint
export async function scanGemini(
  prompt: string,
  brands: string[]
): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { llm: "gemini", prompt, response: "Gemini API key not configured", brandsFound: [] };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const brandsFound = findBrands(response, brands);

    return { llm: "gemini", prompt, response, brandsFound };
  } catch (error) {
    console.error("Gemini scan error:", error);
    return { llm: "gemini", prompt, response: "Error querying Gemini", brandsFound: [] };
  }
}

// Find which brands are mentioned in a response
function findBrands(text: string, brands: string[]): string[] {
  const lowerText = text.toLowerCase();
  return brands.filter((brand) => {
    const lowerBrand = brand.toLowerCase();
    // Check for exact word boundary match
    const regex = new RegExp(`\\b${escapeRegex(lowerBrand)}\\b`, "i");
    return regex.test(lowerText);
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Run a full scan across all LLMs for a keyword
export async function runFullScan(
  keyword: string,
  brands: string[]
): Promise<ScanResult[]> {
  const prompts = generatePrompts(keyword);
  const results: ScanResult[] = [];

  for (const prompt of prompts) {
    const [chatgpt, perplexity, gemini] = await Promise.all([
      scanChatGPT(prompt, brands),
      scanPerplexity(prompt, brands),
      scanGemini(prompt, brands),
    ]);
    results.push(chatgpt, perplexity, gemini);
  }

  return results;
}
