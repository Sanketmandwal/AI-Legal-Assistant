import cloudinary from "../config/cloudinary.js";

export const generateSecureDocumentUrl = (publicId) => {
  const isPdf = publicId.includes('.pdf');
  const resourceType = isPdf ? 'raw' : 'image';

  return cloudinary.url(publicId, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    resource_type: resourceType,
    quality: "auto",
    fetch_format: "auto",
  });
};

// Helper to get all user documents
export const getUserDocuments = async (userId) => {
  const userFolder = `secure/users/${userId}`;
  
  // List all assets in user folder (Admin API)
  const result = await cloudinary.api.resources({
    prefix: userFolder,
    type: "authenticated",
    resource_type: "image",
  });

  console.log("Cloudinary API result:", userId);

  console.log("Cloudinary API result:", result);
  
  return result.resources;
};
