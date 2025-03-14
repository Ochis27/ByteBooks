import UserModel from "@/models/user";
import {sendErrorResponse} from "@/utils/helper";
import {RequestHandler} from "express-serve-static-core";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
        name?: string;
        email: string;
        role: "user" | "author";
      };
    }
  }
}

export const isAuth: RequestHandler = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  // send error response if there is no token
  if (!authToken) {
    return sendErrorResponse({
      message: "Unauthorized request",
      status: 401,
      res,
    });
  }

  // otherwise find out if the token is valid or signed by the same person
  const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
    userId: string;
  };

  // if the token is valid find user from the payload
  // if the token is invalid it will throw error which can handle
  // from inside the error middleware
  const user = await UserModel.findById(payload.userId);
  if (!user) {
    return sendErrorResponse({
      message: "Unauthorized request user not found",
      status: 401,
      res,
    });
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  next();
};
