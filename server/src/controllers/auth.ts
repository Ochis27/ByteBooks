import UserModel from "@/models/user";
import VerificationTokenModel from "@/models/verificationToken";
import {sendErrorResponse} from "@/utils/helper";
import mail from "@/utils/mail";
import crypto from "crypto";
import {RequestHandler} from "express";

export const generateAuthLink: RequestHandler = async (req, res) => {
  // Generate authentication
  // and send the link to the users email address
  const {email} = req.body;
  let user = await UserModel.findOne({email});
  if (!user) {
    // if no user found then create a new user
    user = await UserModel.create({email});
  }
  const userId = user._id.toString();
  // if we already have token for the user it will remove that first
  await VerificationTokenModel.findOneAndDelete({userId});

  const randomToken = crypto.randomBytes(36).toString("hex");
  await VerificationTokenModel.create<{userId: string}>({
    userId,
    token: randomToken,
  });

  // Looking to send emails in production? Check out our Email API/SMTP product!
  const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`;
  user.name = "";

  await mail.sendVerificationMail({
    link,
    to: user.email,
  });

  res.json({message: "Please check your email for link."});
};

export const verifyAuthToken: RequestHandler = async (res, req) => {
  const {token, userId} = req.query;
  if (typeof token !== "string" || typeof userId !== "string") {
    return sendErrorResponse({
      status: 403,
      messahe: "Invalid request!",
      res,
    });
  }
  const verificationToken = await VerificationTokenModel.findOne({userId});

  if (!verificationToken && verifyAuthToken.compare()) {
  }
  res.json({});
};
