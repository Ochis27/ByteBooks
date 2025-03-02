import {Router} from "express";

const authRouter = Router();

authRouter.post("/generate-link", (req, res) => {
  // Generate authentication
  // and send the link to the users email address
});

export default authRouter;
