import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, default: null, sparse: true }, // 🔹 Optional & sparse index
    githubId: { type: String, unique: true, sparse: true }, // 🔹 Added GitHub ID, also optional
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { 
      type: String, 
      default: "https://example.com/default-avatar.png" // 🔹 Default profile pic
    },
    password: { type: String, select: false }, // 🔹 Optional password for non-OAuth users
  },
  {
    collection: 'users', // ✅ Collection name
    timestamps: true, // ✅ CreatedAt & UpdatedAt fields
  }
);


// 🔐 **Hash password before saving (if password exists)**
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next(); // 🔹 Ensure password exists

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('User', UserSchema);
