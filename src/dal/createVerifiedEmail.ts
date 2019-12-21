import { DALContext } from "./DALContext";
import { v4 as uuid } from "uuid";

export function createVerifiedEmail(
  dalContext: DALContext,
  {
    userID,
    email
  }: {
    userID: string;
    email: string;
  }
) {
  const id = uuid();
  const verified = false;

  const params = {
    TableName: "verified-email",
    Item: {
      ID: { S: id },
      Email: { S: email },
      Verified: { BOOL: verified },
      OwnerUserID: { S: userID }
    }
  };

  return new Promise<{
    verifiedEmail: {
      id: string;
      email: string;
      verified: boolean;
      ownerUserID: string;
    };
  }>((resolve, reject) => {
    dalContext.ddb.putItem(params, function(err, data) {
      if (err) {
        console.error(
          new Error(
            `Error creating verified email ${email} for ${userID}: ${err}`
          )
        );
        reject(err);
      } else {
        console.debug(
          `Successfully created verified email ${email} / ${id} with userID ${userID}`
        );

        resolve({
          verifiedEmail: { id, email, verified, ownerUserID: userID }
        });
      }
    });
  });
}
