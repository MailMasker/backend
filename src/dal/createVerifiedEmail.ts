import { DALContext } from "./DALContext";
import { v4 as uuid } from "uuid";

export async function createVerifiedEmail(
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

  //   return new Promise<>((resolve, reject) => {
  //     dalContext.ddb.putItem(params, function(err, data) {
  //       if (err) {
  //         console.error(
  //           new Error(
  //             `Error creating verified email ${email} for ${userID}: ${err}`
  //           )
  //         );
  //         reject(err);
  //       } else {
  //         console.debug(
  //           `Successfully created verified email ${email} / ${id} with userID ${userID}`
  //         );

  //         resolve({
  //           verifiedEmail: { id, email, verified, ownerUserID: userID }
  //         });
  //       }
  //     });
  //   });

  const result = await dalContext.ddb
    .transactWriteItems({
      TransactItems: [
        {
          Put: {
            TableName: "verified-email",
            Item: {
              ID: { S: id },
              Email: { S: email },
              Verified: { BOOL: verified },
              OwnerUserID: { S: userID }
            }
          }
        },
        {
          Update: {
            TableName: "user",
            Key: { ID: { S: userID } },
            UpdateExpression:
              "set VerifiedEmailIDs = list_append(VerifiedEmailIDs, :verified_email_ids)",
            ExpressionAttributeValues: {
              ":verified_email_ids": { L: [{ S: id }] }
            }
          }
        }
      ]
    })
    .promise();

  console.debug("result", result);

  console.debug(
    `Successfully created verified email ${email} / ${id} with userID ${userID}`
  );

  return { id, email, verified, ownerUserID: userID };
}
