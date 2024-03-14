// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey" // keep in sync
});

// ...
async function verifyUser({ email, password }) {
  // ...
  const user = await mongoose.models.User.findOne({ email }).select("+password");
  if (!user) {
    throw new AuthorizationError("No user found with this email");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid || password == null || password === "" || password === undefined) {
    throw new AuthorizationError("Wrong password or username");
  }
  user.password = undefined;
  return user;
}

export async function resetPassword({ email, password }) {
  // ...
  const user = await mongoose.models.User.findOne({ _id: email }).select("+password");
  if (!user) {
    throw new AuthorizationError("No user found with this email");
  }

  const salt = await bcrypt.genSalt(10); // generate a salt
  user.password = await bcrypt.hash(password, salt); // hash the password
  await user.save();
  user.password = undefined;
  return user;

}

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({ form }) => {
      let email = form.get("mail");
      let password = form.get("password");
      let user = null;
      

      if (!email || email?.length === 0) {
        throw new AuthorizationError("Bad Credentials: Email is required");
      }
      if (typeof email !== "string") {
        throw new AuthorizationError("Bad Credentials: Email must be a string");
      }
  
      if (!password || password?.length === 0) {
        throw new AuthorizationError("Bad Credentials: Password is required");
      }
      if (typeof password !== "string") {
        throw new AuthorizationError("Bad Credentials: Password must be a string");
      }
      const verifedUser = await verifyUser({email, password});
      if(verifedUser){
        return verifedUser;
      }
      return verifedUser;
    }),
    "user-pass"
);