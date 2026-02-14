import OpenAI from "openai";

export interface ScanResult {
  llm: string;
  prompt: string;
  response: string;
  brandsFound: string[];
  error?: string;
}

export interface LLMStatus {
  chatgpt: boolean;
  perplexity: boolean;
  gemini: boolean;
}

// Check which LLM API keys are configured
export function getAvailableLLMs(): LLMStatus {
  return {
    chatgpt: !!(process.env.OPENAI_API_KEY?.trim()),
    perplexity: !!(process.env.PERPLEXITY_API_KEY?.trim()),
    gemini: !!(process.env.GEMINI_API_KEY?.trim()),
  };
}

// Lazily create OpenAI client to ensure env vars are available
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  return new OpenAI({ apiKey });
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

// Lighter set of prompts for demo/landing page (cost-efficient)
export function generateLitePrompts(keyword: string): string[] {
  return [
    `What are the best ${keyword}?`,
    `Can you recommend some top ${keyword} for 2025?`,
    `What are the leading ${keyword} in the market?`,
  ];
}

// Query ChatGPT and parse response for brand mentions
export async function scanChatGPT(
  prompt: string,
  brands: string[]
): Promise<ScanResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { llm: "chatgpt", prompt, response: "", brandsFound: [], error: "API key not configured" };
  }

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "";
    const brandsFound = findBrands(response, brands);

    return { llm: "chatgpt", prompt, response, brandsFound };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ChatGPT scan error:", msg);
    return { llm: "chatgpt", prompt, response: "", brandsFound: [], error: msg };
  }
}

// Query Perplexity API
export async function scanPerplexity(
  prompt: string,
  brands: string[]
): Promise<ScanResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) {
    return { llm: "perplexity", prompt, response: "", brandsFound: [], error: "API key not configured" };
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

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Perplexity API ${res.status}: ${errText.substring(0, 200)}`);
    }

    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || "";
    const brandsFound = findBrands(response, brands);

    return { llm: "perplexity", prompt, response, brandsFound };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Perplexity scan error:", msg);
    return { llm: "perplexity", prompt, response: "", brandsFound: [], error: msg };
  }
}

// Query Gemini API
export async function scanGemini(
  prompt: string,
  brands: string[]
): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { llm: "gemini", prompt, response: "", brandsFound: [], error: "API key not configured" };
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

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API ${res.status}: ${errText.substring(0, 200)}`);
    }

    const data = await res.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const brandsFound = findBrands(response, brands);

    return { llm: "gemini", prompt, response, brandsFound };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini scan error:", msg);
    return { llm: "gemini", prompt, response: "", brandsFound: [], error: msg };
  }
}

// Find which brands are mentioned in a response
export function findBrands(text: string, brands: string[]): string[] {
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

// Run a full scan across all LLMs for a keyword (5 prompts × 3 LLMs = 15 calls)
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

// Run a lighter scan for demo/landing page (3 prompts × 3 LLMs = 9 calls)
export async function runLiteScan(
  keyword: string,
  brands: string[]
): Promise<ScanResult[]> {
  const prompts = generateLitePrompts(keyword);
  const results: ScanResult[] = [];

  // Run all prompts in parallel for speed
  const allPromises = prompts.map((prompt) =>
    Promise.all([
      scanChatGPT(prompt, brands),
      scanPerplexity(prompt, brands),
      scanGemini(prompt, brands),
    ])
  );

  const allResults = await Promise.all(allPromises);
  for (const [chatgpt, perplexity, gemini] of allResults) {
    results.push(chatgpt, perplexity, gemini);
  }

  return results;
}

// Scan a single prompt across all LLMs (for testing)
export async function scanSinglePrompt(
  prompt: string,
  brands: string[]
): Promise<ScanResult[]> {
  const [chatgpt, perplexity, gemini] = await Promise.all([
    scanChatGPT(prompt, brands),
    scanPerplexity(prompt, brands),
    scanGemini(prompt, brands),
  ]);
  return [chatgpt, perplexity, gemini];
}
