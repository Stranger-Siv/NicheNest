
import express from "express"
import {config} from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connection } from "./database/connection.js"
import { errorMiddleware } from "./middlewares/error.js"
import fileUpload from "express-fileupload"
import userRouter from "./routes/userRouter.js"
import jobRouter from "./routes/jobRouter.js"
import applicationRouter from "./routes/applicationRouter.js"
import { newsLetterCron } from "./automation/newsLetterCron.js"
import axios from 'axios'

const app = express()
config({path: "./config/config.env"})
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true,
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const url = `https://job-horizon.onrender.com`;
const interval = 30000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloded");
    })
    .catch((error) => {
      console.error(`Error : ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);



app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );

  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/job", jobRouter);
  app.use("/api/v1/application", applicationRouter)

newsLetterCron();
connection()
app.use(errorMiddleware)

export default app;
