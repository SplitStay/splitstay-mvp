import { createClient } from '@supabase/supabase-js';

// Note: In a real production app, these would be environment variables
// For this demo, we're using public keys that don't require secrets
const supabaseUrl = 'https://supabase.splitstay.demo/storage/v1';
const supabaseKey = 'public-demo-key';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to upload a souvenir photo
export async function uploadSouvenirPhoto(file: File, userId: number, tripId: number): Promise<string | null> {
  try {
    // Create a unique file path using user ID and trip ID to enforce one photo per trip
    const filePath = `souvenirs/${userId}/${tripId}/${Date.now()}-${file.name}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('souvenirs')
      .upload(filePath, file, {
        upsert: true, // This will overwrite if the user already uploaded a photo for this trip
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('souvenirs')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadSouvenirPhoto:', error);
    return null;
  }
}

// Function to get all souvenir photos for a specific trip
export async function getSouvenirsByTrip(tripId: number): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('souvenirs')
      .list(`souvenirs/trip-${tripId}`);
    
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }
    
    // Map the file names to public URLs
    return data.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('souvenirs')
        .getPublicUrl(`souvenirs/trip-${tripId}/${file.name}`);
      
      return publicUrlData.publicUrl;
    });
  } catch (error) {
    console.error('Error in getSouvenirsByTrip:', error);
    return [];
  }
}

// Mock function to simulate fetching souvenirs when we don't have actual Supabase credentials
export function getMockSouvenirs(tripId: number): string[] {
  // For demo purposes, return some mock image URLs
  return [
    "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
  ];
}