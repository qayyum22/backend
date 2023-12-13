const mongoose = require("mongoose");

// Define the Tags schema
const socialSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
  link:{
    type: String,
    required: true
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
		ref: "user",
  }
});

// Register the 'Social' model with Mongoose
const Social = mongoose.model('Social', socialSchema);

// Export the 'Social' model
module.exports = Social;