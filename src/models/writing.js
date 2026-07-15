import mongoose from "mongoose";

const WritingQuestionSchema = new mongoose.Schema(
  {
    // 1 = Task 1, 2 = Task 2
    taskType: {
      type: Number,
      enum: [1, 2],
      required: true,
    },

      title: {
      type: String,
      required: true,
      enum: [
        // Task 1
        "Line Chart",
        "Bar Chart",
        "Pie Chart",
        "Table",
        "Process Diagram",
        "Map",
        "Mixed Charts",
        "Flow Chart",

        // Task 2
        "Opinion Essay",
        "Discussion Essay",
        "Advantages & Disadvantages",
        "Problem & Solution",
        "Double Question",
      ],
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