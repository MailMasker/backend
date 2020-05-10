import { NotFoundError } from "../../dal";
import { UserInputError } from "apollo-server-core";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { deleteAllAuthTokensForUserID } from "../../dal/deleteAllAuthTokensForUserID";
import { exportData } from "../../dal/exportData";
import { updateUser } from "../../dal/updateUser";
import { userByID } from "../../dal/userByID";
import { userByUsername } from "../../dal/userByUsername";
import { v4 as uuid } from "uuid";

export const deleteUser = async (
  parent,
  args,
  { clearAuthCookie, dalContext, currentUserID },
  info
) => {
  const user = await userByID(dalContext, currentUserID);

  if (!bcrypt.compareSync(args.password, user.passwordHash)) {
    throw new UserInputError("The password you provided isn't correct");
  }

  const dataBeforeDeletion = await exportData(dalContext, currentUserID);

  const scrambledUsername = uuid();

  // Ensure this scrambled username isn't taken (and try again a couple of times, if so)
  try {
    let user: any;
    for (let i = 0; i < 3; i++) {
      // A NotFoundError should be thrown, unless the user is already taken
      user = userByUsername(dalContext, { username: scrambledUsername });
    }
    if (user) {
      // We should never encounter this code path
      throw new Error(
        "We experienced an error prior to deleting your account. The account has not been deleted."
      );
    }
  } catch (err) {
    if (err instanceof NotFoundError) {
      // This is the expected case
    } else {
      throw err;
    }
  }

  await updateUser(dalContext, currentUserID, {
    username: scrambledUsername,
    deletedISO: dayjs().toISOString(),
  });

  const dataAfterDeletion = await exportData(dalContext, currentUserID);

  await deleteAllAuthTokensForUserID(dalContext, { userID: user.id });

  clearAuthCookie();

  return { dataBeforeDeletion, dataAfterDeletion, scrambledUsername };
};
