
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Feedback Schema
const feedbackSchema = new mongoose.Schema(
  {
    feedbackData: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Feedback Model
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Home Route
app.get("/", (req, res) => {
  res.send("Feedback Server Running Successfully!");
});

// MongoDB Connection Status
app.get("/api/db-status", (req, res) => {
  res.json({
    connected: mongoose.connection.readyState === 1,
    database: mongoose.connection.name
  });
});

// Submit Feedback Route
app.post("/api/feedback", async (req, res) => {
  try {
    const feedbackData = req.body;

    if (
      !feedbackData ||
      typeof feedbackData !== "object" ||
      Array.isArray(feedbackData) ||
      Object.keys(feedbackData).length === 0
    ) {
      return res.status(400).json({
        message: "Feedback data is required"
      });
    }

    const newFeedback = new Feedback({
      feedbackData: feedbackData
    });

    await newFeedback.save();

    console.log("Feedback Saved Successfully:", feedbackData);

    res.status(201).json({
      success: true,
      message: "Feedback submitted and saved successfully!",
      data: newFeedback
    });

  } catch (error) {
    console.error("Feedback Error:", error);

    res.status(500).json({
      success: false,
      message: "Error saving feedback",
      error: error.message
    });
  }
});

// Get All Feedback
app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    res.status(200).json(feedbacks);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching feedback",
      error: error.message
    });
  }
});

// Server Port
const PORT = process.env.PORT || 5000;

// Connect MongoDB Atlas and Start Server
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas Connected Successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

startServer();
