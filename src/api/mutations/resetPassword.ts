import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { MutationResetPasswordArgs } from "../types.generated";
import dayjs from "dayjs";
import { updateUser } from "../../dal/updateUser";
import { userByID } from "../../dal/userByID";

export const resetPassword = async (
  parent,
  args: MutationResetPasswordArgs,
  context: AuthenticatedResolverContext,
  info
) => {
  if (!args.code || !args.newPassword || !args.userID) {
    throw new Error("missing code, new password, or user ID");
  }

  const { resetPasswordRequests } = await userByID(
    context.dalContext,
    args.userID
  );

  if (resetPasswordRequests.length === 0) {
    throw new Error("no password reset request was found");
  }

  let foundMatchingCode = false;
  for (let i = 0; i < resetPasswordRequests.length; i++) {
    const request = resetPasswordRequests[i];
    if (request.code === args.code) {
      foundMatchingCode = true;
      if (dayjs().isAfter(dayjs(request.expiresISO))) {
        await updateUser(context.dalContext, args.userID, {
          password: args.newPassword,
        });

        return true;
      }
    }
  }

  if (!foundMatchingCode) {
    throw new Error("the code you provided did not match our records");
  } else {
    throw new Error("the password reset request has expired");
  }
};
