// This helps us connect to supabase. Do not modify unless you are adding interactive media types
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

// Helper function to get public URL for a file in storage
export function getSupabaseUrl(bucket, filePath) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}

// Helper function to upload a file
export async function uploadFile(bucket, filePath, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)
  
  if (error) {
    console.error('Upload error:', error)
    return { success: false, error }
  }
  
  return { success: true, data }
}
