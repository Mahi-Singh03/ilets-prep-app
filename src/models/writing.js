import mongoose from "mongoose";

const WritingQuestionSchema = new mongoose.Schema(
  {
    // 1 = Task 1, 2 = Task 2
    taskType: {
      type: Number,
      enum: [1, 2],
      required: true,
    },

    // Question title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // IELTS question
    description: {
      type: String,
      required: true,
    },

    // Only used for Task 1
    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WritingQuestion ||
  mongoose.model("WritingQuestion", WritingQuestionSchema);