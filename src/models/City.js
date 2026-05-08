const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
      maxlength: 240,
    },
  },
  { timestamps: true }
);

citySchema.index({ user: 1, name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model("City", citySchema);
