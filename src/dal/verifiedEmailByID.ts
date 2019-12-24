import { ApolloError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { DALContext } from "./DALContext";

export function verifiedEmailByID(
  { ddb }: DALContext,
  id: string
): Promise<{
  id: string;
  email: string;
  verified: boolean;
}> {
  const params = {
    TableName: "verified-email",
    Key: {
      ID: { S: id }
    }
  };

  return new Promise((resolve, reject) => {
    ddb.getItem(params, (err, data) => {
      if (err) {
        console.error(
          new Error(
            `Error getting verified email for id ${id}: ${JSON.stringify(err)}`
          )
        );
        reject(err);
      } else if (
        data.Item &&
        data.Item.ID &&
        data.Item.ID.S &&
        data.Item.Email &&
        data.Item.Email.S &&
        data.Item.Verified &&
        // Necessary to check if BOOL is set (TypeScript doesn't like hasOwnProperty() here)
        (data.Item.Verified.BOOL === true ||
          data.Item.Verified.BOOL === false) &&
        data.Item.OwnerUserID &&
        data.Item.OwnerUserID.S
      ) {
        console.debug(`Successfully got verified email for id ${id}`);
        resolve({
          id: data.Item.ID.S,
          email: data.Item.Email.S,
          verified: data.Item.Verified.BOOL
        });
      } else {
        reject(
          new AuthenticationError(`verified email with id ${id} not found`)
        );
      }
    });
  });
}
