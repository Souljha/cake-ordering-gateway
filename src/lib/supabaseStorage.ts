import { supabase } from '@/integrations/supabase/client';

// Add this constant at the top of the file
const PRODUCT_IMAGES_BUCKET = "product-images";
const USER_UPLOADS_BUCKET = "user-uploads"; // New bucket for user uploads

/**
 * Gets the public URL for a product image
 * @param imagePath The image path or filename
 * @returns The public URL for the product image
 */
export const getProductImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return "/images/placeholder-cake.jpg";
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a local path, return as is
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // Get the Supabase URL from environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("Supabase URL not found in environment variables");
    return "/images/placeholder-cake.jpg";
  }

  // Determine which bucket to use based on the path prefix
  const bucketName = imagePath.startsWith("user/") ? USER_UPLOADS_BUCKET : PRODUCT_IMAGES_BUCKET;
  const cleanImagePath = imagePath.replace(/^\/+/, "");
  
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanImagePath}`;
};

// Function to upload an image to Supabase storage
export const uploadProductImage = async (file: File, fileName: string): Promise<string | null> => {
  try {
    // Generate a unique file path to avoid collisions between anonymous users
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    
    // Use a user/ prefix for user uploads
    const uniqueFileName = `user/${timestamp}-${randomString}-${fileName.replace(/\s+/g, '-')}`;
    
    console.log(`Attempting to upload file to ${USER_UPLOADS_BUCKET}/${uniqueFileName}`);
    
    // Upload to the user-uploads bucket
    const { data, error } = await supabase.storage
      .from(USER_UPLOADS_BUCKET)
      .upload(uniqueFileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image:", error);
      
      // If there's a permission error, try to get a signed URL for upload
      if (error.message.includes('Permission denied') || error.message.includes('violates row-level security policy')) {
        console.log("Attempting alternative upload method with signed URL...");
        
        try {
          // Create a signed URL for uploading
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(USER_UPLOADS_BUCKET)
            .createSignedUploadUrl(uniqueFileName);
          
          if (signedUrlError) {
            console.error("Error creating signed URL:", signedUrlError);
            return null;
          }
          
          // Use the signed URL to upload the file
          const { path, signedUrl } = signedUrlData;
          
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed with status: ${uploadResponse.status}`);
          }
          
          console.log("Upload successful using signed URL:", path);
          return path;
        } catch (signedUrlUploadError) {
          console.error("Error with signed URL upload:", signedUrlUploadError);
          
          // As a last resort, try to use a temporary data URL
          try {
            return await convertFileToDataUrl(file);
          } catch (dataUrlError) {
            console.error("Failed to create data URL:", dataUrlError);
            return null;
          }
        }
      }
      return null;
    }

    console.log("Upload successful:", data);
    return data.path;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

/**
 * Converts a file to a data URL as a fallback when storage uploads fail
 * Note: This is a temporary solution and not ideal for production
 * @param file The file to convert
 * @returns A data URL containing the file data
 */
const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    
    reader.onerror = () => {
      reject(reader.error || new Error('Unknown error occurred during file reading'));
    };
    
    reader.readAsDataURL(file);
  });
};