// src/services/lawyerRatingService.js
import LawyerReview from "../models/LawyerReview.js";
import LawyerProfile from "../models/LawyerProfile.js";

export const updateLawyerRatingSummary = async (lawyerProfileId) => {
  const stats = await LawyerReview.aggregate([
    {
      $match: {
        lawyerProfileId,
        reviewerRole: "citizen",
      },
    },
    {
      $group: {
        _id: "$lawyerProfileId",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const ratingAverage = stats[0]?.ratingAverage || 0;
  const ratingCount = stats[0]?.ratingCount || 0;

  await LawyerProfile.findByIdAndUpdate(lawyerProfileId, {
    ratingAverage: Number(ratingAverage.toFixed(2)),
    ratingCount,
  });
};
