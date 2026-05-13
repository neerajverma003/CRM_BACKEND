import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    Destination: {
      type: mongoose.Schema.Types.String,
      required: true,
      ref: "Destination",
    },
    TravelType:{
      type: String,
      required: true,
    },
    NoOfDay: {
      type: String,
      required: true,
    },
    Upload: [{
      url: { type: String, required: true },
      key: { type: String, required: true }
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Itinerary", itinerarySchema);