// Mock image upload service for browser environment
export async function uploadImage(file: File): Promise<string> {
  try {
    // Create a URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    console.log('Image uploaded successfully:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}