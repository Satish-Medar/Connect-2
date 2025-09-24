import { GoogleGenerativeAI } from "@google/generative-ai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface IssueAnalysis {
  category: string;
  confidence: number;
  priority: string;
  severityScore: number;
  description: string;
  suggestedDepartment: string;
}

export async function analyzeIssueImage(base64Image: string, userDescription?: string): Promise<IssueAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction: "You are an expert civic infrastructure analyst. Analyze images to classify civic issues and determine their priority and severity.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Analyze this civic issue image and provide a detailed assessment. ${userDescription ? `User description: ${userDescription}` : ''}

Please respond with JSON in this exact format:
{
  "category": "pothole|lighting|garbage|signage|graffiti|flooding|other",
  "confidence": 0.95,
  "priority": "low|medium|high|urgent",
  "severityScore": 85,
  "description": "Detailed description of the issue",
  "suggestedDepartment": "public_works|sanitation|utilities|parks|transportation"
}

Consider these factors:
- Size and extent of damage
- Safety implications
- Public accessibility impact
- Urgency of repair needed`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const rawJson = response.text();
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    const analysis = JSON.parse(rawJson);
    
    return {
      category: analysis.category || "other",
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0)),
      priority: analysis.priority || "medium",
      severityScore: Math.max(0, Math.min(100, analysis.severityScore || 50)),
      description: analysis.description || "Issue detected in image",
      suggestedDepartment: analysis.suggestedDepartment || "public_works"
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      category: "other",
      confidence: 0,
      priority: "medium",
      severityScore: 50,
      description: "Manual review required - AI analysis unavailable",
      suggestedDepartment: "public_works"
    };
  }
}

// Enhanced location normalization function
export function normalizeLocation(location: string): string {
  if (!location) return "";
  
  const normalized = location
    .toLowerCase()
    .trim()
    // Remove common district variations
    .replace(/\s+(district|dist|uttar|dakshin|purba|paschim|north|south|east|west)\s+/g, ' ')
    // Normalize common place name variations
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, ''); // Remove special characters
    
  return normalized;
}

export async function findSimilarIssues(
  newIssue: {
    title: string;
    description: string;
    category: string;
    location: string;
    imageUrl?: string;
  },
  existingIssues: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    imageUrl?: string;
    reportedBy: string;
    createdAt: Date;
    validationCount: number;
    status: string;
  }>
): Promise<{
  similarIssues: Array<{
    id: string;
    title: string;
    description: string;
    similarity: number;
    reasons: string[];
    reportedBy: string;
    createdAt: Date;
    validationCount: number;
    status: string;
  }>;
}> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction: `You are an expert at finding similar civic issue reports. You must consider multiple factors:
1. Location similarity (even with different spellings/districts)
2. Issue type and category
3. Description content similarity (same issue from different angles/descriptions)
4. Visual similarity if images are provided
5. Temporal context (recent vs old issues)

Be smart about detecting the SAME physical issue reported from different perspectives.`,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Find similar civic issue reports that might be the same physical problem.

NEW ISSUE:
Title: ${newIssue.title}
Category: ${newIssue.category}
Description: ${newIssue.description}
Location: ${newIssue.location}
${newIssue.imageUrl ? 'Has Image: Yes' : 'Has Image: No'}

EXISTING ISSUES:
${existingIssues.map((issue, index) => 
  `${index + 1}. ID: ${issue.id}
  Title: ${issue.title}
  Category: ${issue.category}
  Description: ${issue.description}
  Location: ${issue.location}
  Status: ${issue.status}
  Validations: ${issue.validationCount}
  ${issue.imageUrl ? 'Has Image: Yes' : 'Has Image: No'}`
).join('\n\n')}

INSTRUCTIONS:
- Look for the SAME physical issue, even if described differently
- Consider location variations (e.g., "bailpar dandeli" = "bailpar uttar kannada dandeli")
- Different photo angles of same pothole/problem should be detected
- Different wording for same issue should be detected
- Only flag as similar if it's likely the SAME physical problem
- Return similarity scores 0.5-0.9 for potentially similar, 0.9+ for very likely same issue

Respond with JSON:
{
  "similarIssues": [
    {
      "issueIndex": 1,
      "similarity": 0.85,
      "reasons": ["Same location area", "Same issue type", "Similar description"],
      "isLikelySameIssue": true
    }
  ]
}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const rawJson = response.text();
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    const result_data = JSON.parse(rawJson);
    
    // Process and format the results
    const similarIssues = (result_data.similarIssues || [])
      .filter((sim: any) => sim.similarity >= 0.5) // Only include medium to high similarity
      .map((sim: any) => {
        const issue = existingIssues[sim.issueIndex - 1];
        if (!issue) return null;
        
        return {
          id: issue.id,
          title: issue.title,
          description: issue.description,
          similarity: Math.max(0, Math.min(1, sim.similarity || 0)),
          reasons: sim.reasons || [],
          reportedBy: issue.reportedBy,
          createdAt: issue.createdAt,
          validationCount: issue.validationCount,
          status: issue.status
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.similarity - a.similarity); // Sort by similarity descending
    
    return { similarIssues };
  } catch (error) {
    console.error("Similar issues detection failed:", error);
    return { similarIssues: [] };
  }
}

export async function detectDuplicateIssue(
  description: string, 
  category: string, 
  existingIssues: Array<{title: string, description: string, category: string}>
): Promise<{isDuplicate: boolean, similarIssueId?: string, confidence: number}> {
  // Keep the old function for backward compatibility
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction: "You are an expert at detecting duplicate civic issue reports. Consider location proximity, issue type, and description similarity.",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `Analyze if this new issue report is a duplicate of existing issues.

New Issue:
Category: ${category}
Description: ${description}

Existing Issues:
${existingIssues.map((issue, index) => `${index + 1}. Category: ${issue.category}, Title: ${issue.title}, Description: ${issue.description}`).join('\n')}

Respond with JSON:
{
  "isDuplicate": true/false,
  "similarIssueIndex": 1,
  "confidence": 0.95,
  "reasoning": "explanation"
}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const rawJson = response.text();
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    const result_data = JSON.parse(rawJson);
    
    return {
      isDuplicate: result_data.isDuplicate || false,
      similarIssueId: result_data.isDuplicate && result_data.similarIssueIndex ? existingIssues[result_data.similarIssueIndex - 1]?.title : undefined,
      confidence: Math.max(0, Math.min(1, result_data.confidence || 0))
    };
  } catch (error) {
    console.error("Duplicate detection failed:", error);
    return { isDuplicate: false, confidence: 0 };
  }
}