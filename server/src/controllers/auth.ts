import {RequestHandler} from "express";

export const generateAuthLink: RequestHandler = (req, res) => {
  // Generate authentication
  // and send the link to the users email address
  console.log(req.body);
  res.json({ok: true});
};
