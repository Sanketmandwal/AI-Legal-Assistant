// src/services/firTimelineService.js
import { generateSecureEvidenceUrl } from "./firEvidenceService.js";

export const mapTimelineWithSignedUrls = (timeline = []) => {
  return timeline.map((event) => {
    const plainEvent = typeof event.toObject === "function" ? event.toObject() : event;

    return {
      ...plainEvent,
      attachments: (plainEvent.attachments || []).map((file) => ({
        publicId: file.publicId,
        filename: file.filename,
        resourceType: file.resourceType,
        uploadedAt: file.uploadedAt,
        signedUrl: generateSecureEvidenceUrl(file.publicId, file.resourceType),
      })),
    };
  });
};
