// ✅ Import required modules
import multer from "multer";
import path from "path";  // <-- REQUIRED in ESM

// 1️⃣ Configure Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/"); // Folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

// 2️⃣ Multer Upload Middleware
export const upload = multer({ storage });
