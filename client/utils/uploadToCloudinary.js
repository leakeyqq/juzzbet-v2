// utils/uploadToCloudinary.ts
export async function uploadToCloudinary(file) {
  try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", `${process.env.NEXT_PUBLIC_CLOUD_PRESET_NAME}`);
      
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
      
        const data = await response.json();
        return data.secure_url; // Use this URL to display or store the image
  } catch (error) {
    console.error(error)
    throw error
  }
  }
  