import "@/db/connect";
import cookieParser from "cookie-parser";
import express from "express";
import "express-async-errors";
import {errorHandler} from "./middlewares/error";
import authRouter from "./routes/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/auth", authRouter);
app.post("/test", (req, res) => {
  console.log(req.body);
  res.json({});
});

app.use(errorHandler);

const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});
