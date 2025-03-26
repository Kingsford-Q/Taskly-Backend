import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { 
      type: String, 
      default: "https://example.com/default-avatar.png" // 🔹 Default profile pic
    },
  },
  {
    collection: 'users', // ✅ Correctly placed
    timestamps: true, // ✅ Correctly placed
  }
);

// Hash password before saving (if password exists)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('User', UserSchema);
