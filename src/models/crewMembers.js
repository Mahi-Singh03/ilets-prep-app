import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    // Common User Fields
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false, // Optional for Google/Facebook login
    },

    image: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      enum: ["credentials", "google", "facebook", "github"],
      default: "credentials",
    },

    // Student Details
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Please provide gender"],
    },

    schoolCollegeUniversityName: {
      type: String,
      required: [true, "Please provide institution name"],
      trim: true,
    },

    session: {
      type: String,
      required: [true, "Please provide session"],
      // Example: 2023-2025
    },

    degreeOrClass: {
      type: String,
      required: [true, "Please provide degree or class"],
      // Example: BCA, MCA, MSc CS, 12th
    },

    languagesLearning: [
      {
        type: String,
        trim: true,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile =
  mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;