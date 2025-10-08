import dotenv from "dotenv";
dotenv.config(); // <-- must be called before using process.env

import DbConnect from "./db/index.js";

DbConnect();
 