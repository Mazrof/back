import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

interface AnalyzeParams {
  type: 'text' | 'image';
  content: string;
}

class ContentFilter {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    // Initialize the Google Generative AI client
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Google API key is missing. Please set the GOOGLE_API_KEY environment variable.'
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'models/gemini-1.5-pro',
    });
  }

  /**
   * Analyzes content and returns whether it's appropriate or inappropriate.
   * @param {AnalyzeParams} params - Parameters object
   * @returns {Promise<string>} - Returns 'appropriate' or 'inappropriate'
   */
  async analyze({ type, content }: AnalyzeParams): Promise<string> {
    try {
      switch (type.toLowerCase()) {
        case 'text':
          return await this.analyzeText(content);
        case 'image':
          return await this.analyzeImage(content);
        default:
          throw new Error('Invalid content type. Must be "text" or "image"');
      }
    } catch (error) {
      console.error('Content filter error:', error);
      return 'inappropriate'; // Default to inappropriate on error for safety
    }
  }

  /**
   * Analyzes text content.
   * @private
   */
  private async analyzeText(text: string): Promise<string> {
    try {
      const prompt = `Analyze if the following content is appropriate or not. Response must be exactly 'appropriate' or 'inappropriate'. Consider inappropriate if the content contains: hate speech, explicit content, violence, harassment, or harmful content. Content: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim().toLowerCase();

      // Only accept 'appropriate' or 'inappropriate' as valid responses
      return response === 'appropriate' ? 'appropriate' : 'inappropriate';
    } catch (error) {
      console.error('Text analysis error:', error);
      return 'inappropriate';
    }
  }

  /**
   * Analyzes image content.
   * @private
   */
  private async analyzeImage(imagePath: string): Promise<string> {
    try {
      // Read the image file from the local computer
      const imageBuffer = fs.readFileSync(imagePath);

      // Convert the image to base64
      const imageBase64 = imageBuffer.toString('base64');

      // Generate content with the base64 image
      const result = await this.model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg', // Ensure the mimeType matches the image type
          },
        },
        "Analyze if the following image is appropriate or not. Response must be exactly 'appropriate' or 'inappropriate'. Consider inappropriate if the content contains: hate speech, explicit content, violence, harassment, or harmful content.",
      ]);

      const response = result.response.text().trim().toLowerCase();

      // Only accept 'appropriate' or 'inappropriate' as valid responses
      return response === 'appropriate' ? 'appropriate' : 'inappropriate';
    } catch (error) {
      console.error('Image analysis error:', error);
      return 'inappropriate';
    }
  }
}

export default ContentFilter;
