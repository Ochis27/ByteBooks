import UserModel from "@/models/user";
import VerificationTokenModel from "@/models/verificationToken";
import {sendErrorResponse} from "@/utils/helper";
import mail from "@/utils/mail";
import crypto from "crypto";
import {RequestHandler} from "express";
import jwt from "jsonwebtoken";

export const generateAuthLink: RequestHandler = async (req, res) => {
  // Generate authentication link
  // and send that link to the users email address

  /*
    1. Generate Unique token for every users
    2. Store that token securely inside the database
       so that we can validate it in future.
    3. Create a link which include that secure token and user information
    4. Send that link to users email address.
    5. Notify user to look inside the email to get the login link
  */

  const {email} = req.body;
  let user = await UserModel.findOne({email});
  if (!user) {
    // if no user found then create new user.
    user = await UserModel.create({email});
  }

  const userId = user._id.toString();

  // if we already have token for this user it will remove that first
  await VerificationTokenModel.findOneAndDelete({userId});

  const randomToken = crypto.randomBytes(36).toString("hex");

  await VerificationTokenModel.create<{userId: string}>({
    userId,
    token: randomToken,
  });

  const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`;

  await mail.sendVerificationMail({
    link,
    to: user.email,
  });

  res.json({message: "Please check you email for link."});
};

export const verifyAuthToken: RequestHandler = async (req, res) => {
  const {token, userId} = req.query;

  if (typeof token !== "string" || typeof userId !== "string") {
    return sendErrorResponse({
      status: 403,
      message: "Invalid request!",
      res,
    });
  }

  const verificationToken = await VerificationTokenModel.findOne({userId});
  if (!verificationToken || !verificationToken.compare(token)) {
    return sendErrorResponse({
      status: 403,
      message: "Invalid request, token mismatch!",
      res,
    });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return sendErrorResponse({
      status: 500,
      message: "Something went wrong, user not found!",
      res,
    });
  }

  await VerificationTokenModel.findByIdAndDelete(verificationToken._id);

  // TODO: authentication
  const payload = {userId: user._id};

  const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });

  res.cookie("authToken", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });

  res.send();
};

export const sendProfileInfo: RequestHandler = (req, res) => {
  res.json({
    profile: req.user,
  });
};

export const logout: RequestHandler = (req, res) => {
  res.clearCookie("authToken").send();
};
