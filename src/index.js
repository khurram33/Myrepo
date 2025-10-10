import dotenv from "dotenv";
dotenv.config(); // <-- must be called before using process.env

import DbConnect from "./db/index.js";
import { app } from "./app.js";

DbConnect()
.then(()=>{
    app.listen(process.env.PORT, () => { console.log(`Server is connected on this port ${process.env.PORT}`);
    })
})
.catch((error)=>{

//    console.log("Server is not connected");
    
})
 