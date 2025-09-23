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

export async function detectDuplicateIssue(
  description: string, 
  category: string, 
  existingIssues: Array<{title: string, description: string, category: string}>
): Promise<{isDuplicate: boolean, similarIssueId?: string, confidence: number}> {
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