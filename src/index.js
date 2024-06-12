import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dbConnect from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

// for checking
app.get("/", (req, res) => {
  res.send("ok");
});

dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`🛞  Server is listening on PORT  : ${port} 🌍`);
    });

    app.on("error", (error) => {
      console.log(`connection ERR : ${error}`);
      throw error;
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection has failed and has this ERROR: ${err}`);
  });

/*
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => {
      console.log("ERR : ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on PORT : ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("ERROR :", error);
    throw error;
  }
})();
*/
