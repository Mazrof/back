import ContentFilter from '../utility/ContentFilter';
import { AppError } from '../utility'; // Import the ContentFilter class

// Create an instance of ContentFilter
const contentFilter = new ContentFilter();

/**
 * Function to filter content based on type (text or image)
 * @param type - The type of the content ('text' or 'image')
 * @param content - The content to be analyzed (text or image path)
 * @returns A promise that resolves to a string ('appropriate' or 'inappropriate')
 */
const filterContent = async (
  type: 'text' | 'image',
  content: string
): Promise<string> => {
  try {
    // Validate type and content
    if (!type || !content) {
      throw new AppError('Type and content are required.', 400);
    }

    // Analyze the content using the ContentFilter class
    const result = await contentFilter.analyze({ type, content });

    // Return the result ('appropriate' or 'inappropriate')
    return result;
  } catch (error) {
    console.error('Error in content filtering function:', error);
    return 'inappropriate'; // Default to inappropriate on error
  }
};

export default filterContent;
