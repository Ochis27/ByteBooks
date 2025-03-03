import crypto from "crypto";
import {RequestHandler} from "express";

export const generateAuthLink: RequestHandler = (req, res) => {
  // Generate authentication
  // and send the link to the users email address
  const randomToken = crypto.randomBytes(36).toString("hex");
  console.log(req.body);
  res.json({ok: true});
};
