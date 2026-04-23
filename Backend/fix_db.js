import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function fixDB() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/FinalYearProject`);
    console.log("Connected to MongoDB.");

    const LawyerProfile = mongoose.model("LawyerProfile", new mongoose.Schema({}, { strict: false }), "lawyerprofiles");
    const FIR = mongoose.model("FIR", new mongoose.Schema({}, { strict: false }), "firs");

    // 1. Fix the lawyer profile to be available, have coordinates, and all specializations
    const result = await LawyerProfile.updateMany(
      {},
      {
        $set: {
          availabilityStatus: "available",
          verificationStatus: "approved",
          "location.type": "Point",
          "location.coordinates": [73.8567, 18.5204], // Pune coordinates (matches FIRs)
          specialization: ["cybercrime", "theft", "assault", "fraud", "harassment", "missing", "other", "criminal law", "family law"],
          city: "Pune",
          state: "Maharashtra"
        }
      }
    );
    console.log(`Updated ${result.modifiedCount} lawyers to have proper location and availability.`);

    // 2. Make sure FIRs have valid categories
    const firUpdate = await FIR.updateMany(
      { "incident.category": { $exists: false } },
      { $set: { "incident.category": "cybercrime" } }
    );
    console.log(`Updated FIRs without categories.`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixDB();
