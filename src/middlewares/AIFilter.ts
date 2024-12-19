// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-expect-error
// import { ImageAnnotatorClient } from '@google-cloud/vision';
// import { config } from 'dotenv';
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-expect-error
// import { GoogleGenerativeAI } from '@google/generative-ai';
//
// // Load environment variables from .env file
// config();
//
// // Initialize Google Vision client
// const visionClient = new ImageAnnotatorClient();
//
// // Initialize GoogleGenerativeAI with API key
// const genAI = new GoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_API_KEY,
// });
//
// // Define generative model
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//
// // Function to get Safe Search analysis for the image
// const getSafeSearchAnalysis = async (imageBase64: string) => {
//   try {
//     // Convert base64 string to buffer
//     const buffer = Buffer.from(imageBase64, 'base64');
//
//     // Call Vision API to analyze the image for Safe Search
//     const [result] = await visionClient.safeSearchDetection({ image: { content: buffer } });
//
//     const safeSearch = result.safeSearchAnnotation;
//
//     return {
//       adult: safeSearch.adult,
//       violence: safeSearch.violence,
//       racy: safeSearch.racy,
//       likelyAdult: safeSearch.adult === 'VERY_LIKELY' || safeSearch.adult === 'LIKELY',
//       likelyViolent: safeSearch.violence === 'VERY_LIKELY' || safeSearch.violence === 'LIKELY',
//       likelyRacy: safeSearch.racy === 'VERY_LIKELY' || safeSearch.racy === 'LIKELY',
//     };
//   } catch (error) {
//     console.error('Error in Safe Search analysis:', error);
//     return null;
//   }
// };
//
// /**
//  * Content filter function to evaluate image safety based on Safe Search detection.
//  * @param {string} imageBase64 - Base64-encoded image string.
//  * @returns {Promise<string>} - "yes" or "no" based on the safety evaluation.
//  */
// export const evaluateImageContent = async (imageBase64: string): Promise<string> => {
//   try {
//     // Step 1: Analyze image for Safe Search (adult, violence, racy content)
//     const safeSearchResult = await getSafeSearchAnalysis(imageBase64);
//
//     if (!safeSearchResult) {
//       return 'error';
//     }
//
//     // Step 2: Check if the image has adult, violent, or racy content
//     if (safeSearchResult.likelyAdult || safeSearchResult.likelyViolent || safeSearchResult.likelyRacy) {
//       return 'no';  // Image contains inappropriate content
//     }
//
//     // Optionally, if you want to pass the description through generative AI for further analysis:
//     const description = `Adult: ${safeSearchResult.adult}, Violence: ${safeSearchResult.violence}, Racy: ${safeSearchResult.racy}`;
//     return await contentFilter(description); // Pass to generative AI model
//   } catch (error) {
//     console.error('Error evaluating image content:', error);
//     return 'error';
//   }
// };
//
// /**
//  * Content filter function (for text analysis).
//  * @param {string} content - The description of the image or content to be evaluated.
//  * @returns {Promise<string>} - "yes" or "no" based on the evaluation.
//  */
// export const contentFilter = async (content: string): Promise<string> => {
//   try {
//     const result = await model.generateContent({
//       prompt: `Is this content safe and appropriate? Answer only "yes" or "no". Content: ${content}`,
//     });
//     const response = await result.response.text();
//     const responseText = response.trim().toLowerCase();
//     if (responseText === "yes" || responseText === "no") {
//       return responseText;
//     }
//     throw new Error('Unexpected response from the model');
//   } catch (error) {
//     console.error('Error in content filtering:', error);
//     return 'error';
//   }
// };
//
//
//
//
// // import { config } from "dotenv";
// // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // // @ts-expect-error
// // import { GoogleGenerativeAI } from "@google/generative-ai";
// //
// // // Load environment variables from .env file
// // config();
// //
// // // Initialize GoogleGenerativeAI with API key
// // const genAI = new GoogleGenerativeAI({
// //   apiKey: process.env.GOOGLE_API_KEY,
// // });
// //
// // // Define generative model
// // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// //
// // /**
// //  * Content filter function
// //  * @param {string} content - The text or description of the photo to be evaluated.
// //  * @returns {Promise<string>} - "yes" or "no" based on the evaluation.
// //  */
// // export const contentFilter = async (content) => {
// //   try {
// //     const result = await model.generateContent({
// //       prompt: `Is this content safe and appropriate? Answer only "yes" or "no". Content: ${content}`,
// //     });
// //     const response = result.response.text().trim().toLowerCase();
// //     if (response === "yes" || response === "no") {
// //       return response;
// //     }
// //     throw new Error("Unexpected response from the model");
// //   } catch (error) {
// //     console.error("Error in content filtering:", error);
// //     return "error";
// //   }
// // };
// //
