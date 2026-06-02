import { allowedOrigins } from "./allowedOrigins.js";
export const corsOptions = {
  origin: function (origin, cb) {
    if (
      !origin || 
      allowedOrigins.indexOf(origin) !== -1 || 
      origin.startsWith("http://localhost:") || 
      origin.startsWith("http://127.0.0.1:")
    ) {
      // console.log(origin, "Success");
      cb(null, true);
    } else {
      console.log(origin, "Error");
      cb(new Error("Not allowed by Cors"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

