// app/services/auth.server.ts
import { WebAuthnStrategy } from "remix-auth-webauthn/server";
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage, commitSession, getSession } from "./session.server";
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
  let user = await mongoose.models.User.findOne({ email }).select("+password");
  if (!user) {
    throw new AuthorizationError("No user found with this email");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid || password == null || password === "" || password === undefined) {
    throw new AuthorizationError("Wrong password or username");
  }
  user.password = undefined;
  if(user.settings.security.passkeys.length > 0){
    //send 2fa code
    const passKey = user.settings.security.passkeys
    return {passKey, user};
  } else{
    return user;
  }
  
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

async function getUserByUsername(email) {
  // ...
  return await mongoose.models.User.findOne({ email });
}

async function getAuthenticators(email) {
  // ...
  return await mongoose.models.User.findOne({ email }).select("security.passkeys");
}

async function getAuthenticatorById(id) {
  // ...
  return await mongoose.models.User.findOne({ "security": { "passkeys": { $elemMatch: { id } } } });
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

export const webAuthnStrategy = new WebAuthnStrategy(
  {
    // Options here...
},
  async function verify({ authenticator, type, username }) {
    let user = null;
    const savedAuthenticator = await getAuthenticatorById(
      authenticator.credentialID
    );
    if (type === "registration") {
      // Check if the authenticator exists in the database
      if (savedAuthenticator) {
        throw new Error("Authenticator has already been registered.");
      } else {
        // Username is null for authentication verification,
        // but required for registration verification.
        // It is unlikely this error will ever be thrown,
        // but it helps with the TypeScript checking
        if (!username) throw new Error("Username is required.");
        user = await getUserByUsername(username);

        // Don't allow someone to register a passkey for
        // someone elses account.
        if (user) throw new Error("User already exists.");

        // Create a new user and authenticator
        user = await createUser(username);
        await createAuthenticator(authenticator, user.id);
      }
    } else if (type === "authentication") {
      if (!savedAuthenticator) throw new Error("Authenticator not found");
      user = await getUserById(savedAuthenticator.userId);
    }

    if (!user) throw new Error("User not found");
    return user;
  }
);

export function oauthAuthenticated({ request }) {
  const cookie = request?.headers?.get("Cookie");
  if (cookie) {
    const sessionId = cookie.split(";").find((c) => c.includes("_loggedin"));
    if (sessionId) {
      return sessionId.split("=")[1];
    }
  }
}

export async function oauthLogin(user, {
  successRedirect,
  failureRedirect
}) {
  let session = await getSession();
  if(!session){
    session = await commitSession(sessionStorage);
  }
  session.set("user", user);
  const foundUser = await mongoose.models.User.findOne({
    _id: user._id,
    linkedAccount: {
      $elemMatch: {
        provider: user.linkedAccount.provider,
      },
    },
  })

  if (foundUser) {
    const sessionId = await commitSession(session);
    return new Response(null, {
      status: 302,
      headers: {
        Location: successRedirect,
        "Set-Cookie": `${
          sessionId
        }; Path=/; HttpOnly; SameSite=Lax`,
      },
    });
  }
}

/* authenticator.use(
  new WebAuthnStrategy(
    {
      // The human-readable name of your app
      // Type: string | (response:Response) => Promise<string> | string
      rpName: "Devhelp.dk | Intastellar Solutions",
      // The hostname of the website, determines where passkeys can be used
      // See https://www.w3.org/TR/webauthn-2/#relying-party-identifier
      // Type: string | (response:Response) => Promise<string> | string
      rpID: (request) => new URL(request.url).hostname,
      // Website URL (or array of URLs) where the registration can occur
      origin: (request) => new URL(request.url).origin,
      // Return the list of authenticators associated with this user. You might
      // need to transform a CSV string into a list of strings at this step.
      getUserAuthenticators: async (user) => {
        const authenticators = await getAuthenticators(user);
  
        return authenticators.map((authenticator) => ({
          ...authenticator,
          transports: authenticator.transports.split(","),
        }));
      },
      // Transform the user object into the shape expected by the strategy.
      // You can use a regular username, the users email address, or something else.
      getUserDetails: (user) =>
        user ? { id: user.id, username: user.username } : null,
      // Find a user in the database with their username/email.
      getUserByUsername: (username) => getUserByUsername(username),
      getAuthenticatorById: (id) => getAuthenticatorById(id),
    },
    async function verify({ authenticator, type, username }) {
      // Verify Implementation Here
    }
  ),
  "passkey"
) */