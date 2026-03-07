// src/services/documentService.js
import cloudinary from "../config/cloudinary.js";

export const generateSecureDocumentUrl = (publicId) => {

    const expiresAt = Math.floor(Date.now() / 1000) + 300; // valid for 5 minutes

    const url = cloudinary.url(publicId, {
        type: "authenticated",
        sign_url: true,
        secure: true,
        expires_at: expiresAt
    });

    return url;
};
