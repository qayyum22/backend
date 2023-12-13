const mongoose = require("mongoose");

// Define the Courses schema
const coursesSchema = new mongoose.Schema({
  courseName: { type: String },
  courseDescription: { type: String },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: "Category",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
  language: {
    type: String,
    required: true,
  },

  level: {
    type: String,
    required: true,
  },

  totalLectures: {
    type: Number,
  },

  totalDuration: {
    type: String,
  },

  rating: {
    type: Number,
  },

  title: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

// Export the Courses model
module.exports = mongoose.model("Course", coursesSchema);
