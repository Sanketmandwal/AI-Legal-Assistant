import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function checkData() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/FinalYearProject`);
    console.log("Connected to MongoDB.");

    const CitizenProfile = mongoose.model("CitizenProfile", new mongoose.Schema({}, { strict: false }), "citizenprofiles");
    const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }), "users");
    const CaseChatRoom = mongoose.model("CaseChatRoom", new mongoose.Schema({}, { strict: false }), "casechatrooms");
    const FIR = mongoose.model("FIR", new mongoose.Schema({}, { strict: false }), "firs");

    const ChatMessage = mongoose.model("ChatMessage", new mongoose.Schema({}, { strict: false }), "chatmessages");

    const users = await User.find().lean();
    for (const user of users) {
      if (["citizen", "lawyer"].includes(user.role)) {
        const query = user.role === "citizen" ? { citizenId: user._id } : { lawyerUserId: user._id };
        const rooms = await CaseChatRoom.find(query).lean();
        const roomIds = rooms.map(r => r._id);
        
        const unreadCounts = await ChatMessage.aggregate([
          { $match: { roomId: { $in: roomIds }, senderId: { $ne: user._id }, "readBy.userId": { $ne: user._id } } },
          { $group: { _id: "$roomId", unreadCount: { $sum: 1 } } }
        ]);
        console.log(`User ${user.name} (${user.role}) Unread Counts:`, unreadCounts);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();
