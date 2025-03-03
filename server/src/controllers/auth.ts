import UserModel from "@/models/user";
import VerificationTokenModel from "@/models/verificationToken";
import crypto from "crypto";
import {RequestHandler} from "express";
import nodemailer from "nodemailer";

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
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "fbc810c6277886",
      pass: "6947e32eda7f9f",
    },
  });
  const link = `http://localhost:8989/verify?token=${randomToken}&userId=${userId}`;
  await transport.sendMail({
    to: user.email,
    from: "bytebookssupport@gmail.com",
    subject: "Auth Verification",
    html: `
    <div>
    <p>Please click on <a href="${link}">this link</a> to very your account</p>
    </div>
    `,
  });

  res.json({message: "Please check your email for link."});
};
