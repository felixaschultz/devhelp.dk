import { authenticator } from "../services/auth.server";

export const action = async ({ request }) => {
  await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/",
  });
};