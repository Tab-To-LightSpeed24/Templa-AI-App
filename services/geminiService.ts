import { GoogleGenAI, Type } from "@google/genai";
import { DocumentType, ChatMessage, Project, AIActionResponse } from "../types";

const getClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not set in your .env.local file.");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateTitle = async (topic: string): Promise<string> => {
    const ai = getClient();
    const modelId = "gemini-2.5-flash";

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Based on this topic/prompt: \"${topic}\", generate a short, professional, and catchy title (3-6 words max) for a business presentation/document. Return ONLY the title text. Do not use quotes or html tags.`,
        });
        return response.text?.trim() || "Untitled Project";
    } catch (error) {
        console.error("Title generation failed:", error);
        return "Untitled Project";
    }
};

export const generateOutline = async (topic: string, type: DocumentType, count: number = 5): Promise<string[]> => {
    const ai = getClient();
    const modelId = "gemini-2.5-flash";

    let systemInstruction = `You are an expert business strategy consultant.`;
    
    if (type === DocumentType.PPTX) {
        systemInstruction += `
        Create a PowerPoint outline following this EXACT 10-Step Narrative Arc:
        1. Title Slide
        2. The Problem Statement
        3. Why It Matters (Impact)
        4. Current Landscape & Gaps
        5. Our Solution
        6. How It Works
        7. Validation & Results
        8. Business Impact & ROI
        9. Future Roadmap
        10. Conclusion
        
        Adjust titles to be specific to: \"${topic}\".
        Keep titles short (2-6 words).
        `;
    } else {
        systemInstruction += `
        Create a detailed outline for a professional Business Document (Word).
        Target ${count} sections.
        Include standard business sections (Executive Summary, Introduction, Market Analysis, Solution Architecture, Financial Projections, Conclusion).
        `;
    }

    systemInstruction += ` Return ONLY a JSON object with a list of strings.`;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Create an outline for: ${topic}.`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sections: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of section headers or slide titles"
                        }
                    },
                    required: ["sections"]
                }
            }
        });

        const json = JSON.parse(response.text || '{\"sections\": []}');
        return json.sections;

    } catch (error) {
        console.error("Outline generation failed:", error);
        const fallback = [];
        for(let i=1; i<=count; i++) fallback.push(`Section ${i}`);
        return fallback;
    }
};

export const generateSectionContent = async (
    topic: string,
    sectionTitle: string,
    type: DocumentType,
    context?: string
): Promise<string> => {
    const ai = getClient();
    const modelId = "gemini-2.5-flash"; 

    let prompt = "";

    if (type === DocumentType.PPTX) {
        // PPTX: Bullet Heavy, Visual Tags, Strict Limits
        prompt = `
        Topic: ${topic}
        Slide: ${sectionTitle}
        
        Task: Write content for a PowerPoint slide (16:9).
        
        MANDATORY LAYOUT TAG (Line 1): [LAYOUT: TIMELINE] | [LAYOUT: WORKFLOW] | [LAYOUT: GRID] | [LAYOUT: CENTERED] | [LAYOUT: TABLE] | [LAYOUT: STANDARD]

        CONTENT RULES (CRITICAL FOR FITTING):
        1. **Extreme Brevity**: Max 5 bullet points. Max 8-10 words per point.
        2. **Structure**: List format only. No paragraphs.
        3. **Clean**: No HTML tags (<h1>, etc). No markdown bold/italic inside lines.
        4. **Data**: Realistic simulated numbers.
        
        ${context ? `Context: ${context}` : ''}
        `;
    } else {
        // DOCX: Business Prose, Paragraphs
        prompt = `
        Topic: ${topic}
        Section Title: ${sectionTitle}
        
        Task: Write a professional business document section.
        
        STRICT FORMATTING RULES:
        1. **FORMAT**: Use distinct, well-structured PARAGRAPHS (3-6 lines each).
        2. **BULLETS**: Use bullet points ONLY for lists of features, stats, or steps. Do NOT bullet the entire section.
        3. **NO TITLE REPETITION**: Do NOT output the text \"${sectionTitle}\" at the start. Start directly with the intro paragraph.
        4. **HEADINGS**: Use '##' for subsections.
        5. **TONE**: Formal, concise, objective business writing.
        6. **NO HTML**: Use strict Markdown.
        
        Output ONLY the text content in Markdown.
        ${context ? `Context: ${context}` : ''}
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || "";
    } catch (error) {
        console.error("Content generation failed:", error);
        return "Error generating content.";
    }
};

export const refineText = async (content: string, instruction: string): Promise<string> => {
    const ai = getClient();
    const modelId = "gemini-2.5-flash";

    const prompt = `
    Original Content:
    \"\"\"
    ${content}
    \"\"\"

    User Instruction: \"${instruction}\"

    Task: Rewrite the content above following the instruction.
    - YOU HAVE FULL FREEDOM: Change tone, length, format, or even switch layouts if asked.
    - If asked to "make it a table", convert data to Markdown table.
    - If asked to "make it a workflow", add [LAYOUT: WORKFLOW].
    - If asked for paragraphs, remove bullets and write prose.
    - Maintain professional business tone.
    - Do NOT use HTML tags.
    
    Return ONLY the rewritten text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || content;
    } catch (error) {
        console.error("Refine text failed:", error);
        return content;
    }
};

export const applyLayout = async (content: string, layout: string): Promise<string> => {
    const ai = getClient();
    const modelId = "gemini-2.5-flash";

    const prompt = `
    Original: \"\"\"${content}\"\"\"
    Task: Format this content to fit [LAYOUT: ${layout}].
    Keep it concise. Remove markdown formatting within lines.
    Start output with [LAYOUT: ${layout}].
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || content;
    } catch (error) {
        console.error("Apply layout failed:", error);
        return content;
    }
};

// Deprecated: Replaced by per-section refinement
export const chatWithProjectAI = async (
    messages: ChatMessage[], 
    project: Project,
    activeSectionId?: string
): Promise<AIActionResponse> => {
    return { message: "Chat deprecated", action: 'NONE' };
}