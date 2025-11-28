import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { RecipeData } from "../types";

// Initialize Gemini Client
// We create instances per request to ensure latest API key, but keep a reference if needed.

// Define the schema object (used for prompt injection now, since we use Search tool)
const recipeSchemaStructure = {
  type: Type.OBJECT,
  properties: {
    dishName: { type: Type.STRING, description: "The name of the identified African or Caribbean dish." },
    origin: { type: Type.STRING, description: "Country or region of origin (e.g., 'Senegal', 'Jamaica', 'Nigeria')." },
    description: { type: Type.STRING, description: "A sophisticated, appetizing description of the dish, highlighting its cultural significance and flavor notes." },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of ingredients with precise quantities."
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Professional, step-by-step cooking instructions."
    },
    specialIngredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "Brief culinary context for this ingredient." },
          substitute: { type: Type.STRING, description: "Viable substitutes for the diaspora kitchen." }
        },
        required: ["name", "explanation", "substitute"]
      },
      description: "Details on specific indigenous ingredients found in the dish."
    },
    flavorProfile: {
      type: Type.OBJECT,
      properties: {
        spicy: { type: Type.INTEGER, description: "0-10 scale" },
        sweet: { type: Type.INTEGER, description: "0-10 scale" },
        savory: { type: Type.INTEGER, description: "0-10 scale" },
        sour: { type: Type.INTEGER, description: "0-10 scale" },
        bitter: { type: Type.INTEGER, description: "0-10 scale" }
      },
      required: ["spicy", "sweet", "savory", "sour", "bitter"]
    },
    cookingTime: { type: Type.STRING, description: "Estimated cooking time e.g., '45 mins'" },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
  },
  required: ["dishName", "origin", "description", "ingredients", "instructions", "specialIngredients", "flavorProfile", "cookingTime", "difficulty"]
};

// Helper to clean and parse JSON from LLM text response
const cleanAndParseJSON = (text: string): RecipeData => {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Locate the first { and last } to handle potential intro/outro text
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanText) as RecipeData;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("We encountered an issue parsing the recipe details. Please try again.");
  }
};

// Helper to map raw errors to user-friendly messages
const mapGeminiError = (error: any, context: string): Error => {
  let msg = "";

  if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error === 'object' && error !== null) {
    if (error.error && error.error.message) {
      msg = error.error.message;
    } else if (error.message) {
      msg = error.message;
    } else {
      try {
        msg = JSON.stringify(error);
      } catch (e) {
        msg = String(error);
      }
    }
  } else {
    msg = String(error);
  }

  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes("429") || lowerMsg.includes("quota")) {
    return new Error(`Our kitchen is currently at capacity. Please allow a moment before trying again.`);
  }
  if (lowerMsg.includes("401") || lowerMsg.includes("403") || lowerMsg.includes("api key")) {
    return new Error(`Authentication failed. Please verify your API key configuration.`);
  }
  if (lowerMsg.includes("safety") || lowerMsg.includes("blocked")) {
    return new Error(`The request could not be processed due to content safety guidelines.`);
  }
  if (lowerMsg.includes("fetch") || lowerMsg.includes("network") || lowerMsg.includes("failed to fetch")) {
    return new Error(`Connection interrupted. Please check your network settings.`);
  }
  if (lowerMsg.includes("json") || error instanceof SyntaxError) {
    return new Error(`We were unable to structure the recipe data correctly. Please try a different query.`);
  }
  if (lowerMsg.includes("candidate")) {
    return new Error(`The content could not be generated due to policy restrictions.`);
  }
  if (lowerMsg.includes("entity was not found") || lowerMsg.includes("not_found")) {
    return new Error("The requested resource was not found. If this is about the API Key, please try selecting it again.");
  }
  // Check for our custom error message
  if (msg.includes("I couldn't access the details")) {
    return new Error(msg);
  }

  return new Error(`An error occurred while ${context === 'image' ? 'analyzing the image' : 'processing your request'}. Please try again.`);
};

// Common safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const generateRecipe = async (input: { type: 'image' | 'text' | 'random', value: string }): Promise<RecipeData> => {
  // Use environment variable if available (production), otherwise rely on AI Studio (development)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const currentAi = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
  const model = "gemini-2.5-flash";

  try {
    const parts = [];
    const schemaString = JSON.stringify(recipeSchemaStructure, null, 2);

    // Configuration for the request
    const config: any = {
      // Updated tone: Sophisticated, Professional, Authentic, Warm but not patronizing.
      systemInstruction: `You are the Head Chef of Foodstagram Africa, a premium digital community celebrating authentic African and Caribbean cuisine. 
      Your audience consists of sophisticated food lovers, the diaspora, and home cooks who value authenticity and culinary history.
      
      Tone Guidelines:
      - Be knowledgeable, warm, and professional (like an expert auntie or a chef instructor).
      - Avoid calling the user "child" or using overly distinct "storyteller" tropes unless relevant to the dish's history.
      - Focus on flavor profiles, technique, and regional accuracy.
      - When explaining ingredients, assume the user is intelligent but may need sourcing tips for the diaspora (US/UK/Canada).`,

      safetySettings: safetySettings,
    };

    if (input.type === 'image') {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: input.value
        }
      });
      parts.push({
        text: `Analyze this image as an expert chef.
        Identify the dish and its specific regional origin (e.g., 'Nigerian Jollof' vs 'Ghanaian Jollof' if distinguishable).
        Provide a detailed, authentic recipe.
        
        If the image is not clearly food, politely inform the user and offer a classic 'Jollof Rice' recipe as a courtesy, noting that the image was unclear.
        
        IMPORTANT: Output the response strictly as a valid JSON object matching this schema:
        ${schemaString}
        Do not include markdown formatting like \`\`\`json.`
      });
    } else if (input.type === 'random') {
      parts.push({
        text: `You are the Head Chef. The user is asking: "I'm feeling hungry, surprise me!".
          
          Task:
          1. Select a popular, authentic African or Caribbean dish (e.g. Jerk Chicken, Jollof Rice, Bunny Chow, Oxtail Stew, Egusi, Ackee & Saltfish, Pepper Soup, etc.). 
          2. Generate a full, authentic recipe for it.
          
          Selection Criteria:
          - Choose a dish that is visually appealing and culturally significant.
          - Do NOT ask the user for input. Select the dish yourself.
          
          IMPORTANT: Output the response strictly as a valid JSON object matching this schema:
          ${schemaString}
          Do not include markdown formatting like \`\`\`json.`
      });
    } else {
      // Text or URL input - Enable Search Tool
      config.tools = [{ googleSearch: {} }];

      // Basic URL detection
      const isUrl = /^(http|https):\/\/[^ "]+$/.test(input.value);

      if (isUrl) {
        parts.push({
          text: `The user provided this URL: "${input.value}".
          
          Your Goal: Identify the specific African or Caribbean dish featured in this content using Google Search.
          
          SEARCH STRATEGY:
          1. Search for the full URL to see page titles or snippets.
          2. EXTRACT the unique ID from the URL (e.g., from 'instagram.com/p/ID', 'tiktok.com/@user/video/ID', 'youtube.com/watch?v=ID'). Search specifically for this ID combined with the platform name to find reposts, captions, or descriptions.
          3. Look for culinary keywords (dish names, ingredients) in the search snippets.

          DECISION LOGIC:
          - If you find the dish name: Generate the authentic recipe using the schema below.
          - If the link is private, broken, or yields NO specific dish information: DO NOT GUESS. DO NOT return a random recipe.
          - Instead, return a JSON object where 'dishName' is exactly "LINK_ACCESS_ERROR".

          Output must be valid JSON matching this schema:
          ${schemaString}
          
          Failure/Error JSON format:
          {
            "dishName": "LINK_ACCESS_ERROR", 
            "origin": "Unknown", 
            "description": "Error", 
            "ingredients": [], 
            "instructions": [], 
            "specialIngredients": [], 
            "flavorProfile": {"spicy":0,"sweet":0,"savory":0,"sour":0,"bitter":0}, 
            "cookingTime": "0m", 
            "difficulty": "Easy"
          }
          `
        });
      } else {
        parts.push({
          text: `The user provided this text query: "${input.value}".
          
          Task:
          1. Answer the query with expert culinary knowledge.
          2. Generate a full, authentic African or Caribbean recipe based on the request.
          
          IMPORTANT: Output the response strictly as a valid JSON object matching this schema:
          ${schemaString}
          Do not include markdown formatting like \`\`\`json.`
        });
      }
    }

    const response = await currentAi.models.generateContent({
      model: model,
      contents: {
        parts: parts
      },
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = cleanAndParseJSON(text);

    // Handle the explicit error state from the URL prompt
    if (result.dishName === "LINK_ACCESS_ERROR") {
      throw new Error("I couldn't access the details of that link. It might be private or not indexed yet. Please try describing the dish or uploading a photo!");
    }

    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw mapGeminiError(error, input.type === 'image' ? 'image' : 'request');
  }
};

export const generateCookingVideo = async (dishName: string, origin: string): Promise<string> => {
  // Use environment variable if available (production), otherwise rely on AI Studio (development)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const currentAi = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
  const model = "veo-3.1-fast-generate-preview";

  try {
    const prompt = `A cinematic, appetizing, high-quality video of authentic ${dishName} from ${origin}. Professional food photography, 4k, slow motion, steam rising, delicious presentation, warm lighting.`;

    let operation = await currentAi.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await currentAi.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Failed to generate video URI");

    return videoUri;
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw mapGeminiError(error, "video generation");
  }
};