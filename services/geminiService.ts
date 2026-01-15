
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // Use process.env.API_KEY directly as per guidelines
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  // Initialize with named parameter
  return new GoogleGenAI({ apiKey });
};

export const generateScriptIdea = async (topic: string, style: string): Promise<string> => {
  try {
    const ai = getClient();
    // Using gemini-3-flash-preview as per task type recommendation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `请为一个视频创作详细的脚本大纲，内容必须使用中文。
      主题: "${topic}".
      风格/基调: ${style}.
      请包含以下部分:
      1. 吸引人的标题
      2. 开头钩子 (0-5秒)
      3. 关键场景 (使用列表形式)
      4. 结尾号召 (Call to Action)`,
    });
    
    // Access .text property directly, not as a method
    return response.text || "未能生成回复。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "生成脚本时出错，请检查您的 API Key。";
  }
};
