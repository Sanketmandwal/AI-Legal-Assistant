// src/services/firEvidenceService.js
import cloudinary from "../config/cloudinary.js";

export const generateSecureEvidenceUrl = (publicId, resourceType = "image") => {
  return cloudinary.url(publicId, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    resource_type: resourceType,
    quality: "auto",
    fetch_format: "auto",
  });
};
