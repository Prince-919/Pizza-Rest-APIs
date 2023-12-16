import express from "express";
import { APP_PORT, DB_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
import mongoose from "mongoose";
import path from "path";
const app = express();

// routes
import routes from "./routes";

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected...");
});

global.appRoot = path.resolve(__dirname);
// middlewares
app.use(express.json());

// routes
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));

app.use(errorHandler);

app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}.`));
