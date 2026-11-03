import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // NextAuth-এর অ্যাডাপ্টারের জন্য এই দুটি ফিল্ড রাখা ভালো
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);