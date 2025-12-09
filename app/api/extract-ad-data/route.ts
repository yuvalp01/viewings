import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import { z } from "zod";

// Rate limiting: in-memory store
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = parseInt(process.env.EXTRACTION_RATE_LIMIT || "10", 10);
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Response schema
const ExtractionResponseSchema = z.object({
  size: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  bedrooms: z.number().nullable().optional(),
  floor: z.number().nullable().optional(),
  constructionYear: z.number().nullable().optional(),
  isElevator: z.boolean().nullable().optional(),
});

type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

// Clean up old rate limit entries
function cleanRateLimit() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const filtered = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW);
    if (filtered.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, filtered);
    }
  }
}

// Check rate limit
function checkRateLimit(ip: string): boolean {
  cleanRateLimit();
  const timestamps = rateLimitMap.get(ip) || [];
  const now = Date.now();
  const recentRequests = timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Fetch and parse webpage content
async function fetchWebpageContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove script and style elements
  $("script, style, noscript").remove();

  // Extract text content
  const textContent = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 10000); // Limit to 10k characters

  return textContent;
}

// Extract data using OpenAI
async function extractWithAI(content: string): Promise<ExtractionResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `Extract apartment details from this real estate ad content.
Return ONLY valid JSON with these fields:
- size (number in sqm or null)
- price (number or null)
- bedrooms (number or null)
- floor (number or null)
- constructionYear (number or null)
- isElevator (boolean or null)

If a field cannot be determined, use null.

Ad content:
${content}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", 
    messages: [
      {
        role: "system",
        content:
          "You are a real estate data extraction assistant. Extract apartment details from ad content and return only valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error("No response from OpenAI");
  }

  // DEBUG: Log raw response from OpenAI
  console.log("=== RAW OpenAI Response ===");
  console.log(responseText);
  console.log("=== End Raw Response ===");

  try {
    const parsed = JSON.parse(responseText);
    // Debug log to see what AI extracted
    console.log("AI extracted data (parsed):", JSON.stringify(parsed, null, 2));
    return ExtractionResponseSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error);
    console.error("Raw response text:", responseText);
    throw new Error("Invalid response format from AI");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Maximum ${RATE_LIMIT} requests per hour.`,
        },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "URL is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Only allow http/https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are allowed" },
        { status: 400 }
      );
    }

    // Fetch webpage content
    let content: string;
    try {
      content = await fetchWebpageContent(url.toString());
    } catch (error) {
      console.error("Error fetching webpage:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Failed to fetch webpage: ${error.message}`
              : "Failed to fetch webpage",
        },
        { status: 500 }
      );
    }

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: "Unable to extract sufficient content from the webpage" },
        { status: 400 }
      );
    }

    // Extract data with AI
    let extractedData: ExtractionResponse;
    try {
      extractedData = await extractWithAI(content);
    } catch (error) {
      console.error("Error extracting data with AI:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `AI extraction failed: ${error.message}`
              : "AI extraction failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: extractedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in extract-ad-data:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

