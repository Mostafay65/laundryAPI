import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./configurations/databaseConnection.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 4352;

connectDB();

mongoose.connection.once("open", () => {
    console.log("DB connected successfully!");

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}.`);
    });
});
