import {compareSync, genSaltSync, hashSync} from "bcrypt";
import {Model, model, Schema} from "mongoose";

interface VerficationTokenDoc {
  userId: string;
  token: string;
  expires: Date;
}

interface Methods {
  compare(token: string): boolean;
}

const verificationTokenSchema = new Schema<VerficationTokenDoc, {}, Methods>({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    default: Date.now(),
    expires: 60 * 60 * 24,
  },
});

verificationTokenSchema.pre("save", function (next) {
  if (this.isModified("token")) {
    const salt = genSaltSync(10);
    this.token = hashSync(this.token, salt);
  }
  next();
});

verificationTokenSchema.methods.compare = function (token: string) {
  return compareSync(token, this.token);
};

const VerificationTokenModel = model(
  "VerificationToken",
  verificationTokenSchema
);

export default VerificationTokenModel as Model<
  VerficationTokenDoc,
  {},
  Methods
>;
