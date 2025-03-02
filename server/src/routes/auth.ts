import {generateAuthLink} from "@/controllers/auth";
import {Router} from "express";
import {z} from "zod";

const authRouter = Router();

const schema = z.object({
  email: z
    .string({required_error: "Email is missing"})
    .email("Invalid email address!"),
});

authRouter.post(
  "/generate-link",
  (req, res, next) => {
    const {email} = req.body;
    // const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
    // if (!regex.test(email)) {
    //   // sending error response
    //   return res.status(422).json({error: "Invalid email!"});
    // }
    const result = schema.safeParse(req.body);
    if (!result.success) {
      console.log(JSON.stringify(result, null, 2));
      const errors = result.error.flatten().fieldErrors;
      return res.status(422).json({errors});
    }
    next();
  },
  generateAuthLink
);

export default authRouter;
