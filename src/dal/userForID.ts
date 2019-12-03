import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function userForID(
  { ddb }: DALContext,
  userID: string
): Promise<{ username: string; email: string; id: string }> {
  console.log("getting user data for id", userID);
  const params = {
    TableName: "user",
    Key: {
      ID: { S: userID }
    }
  };

  return new Promise((resolve, reject) => {
    ddb.getItem(params, (err, data) => {
      console.log("item", data.Item);
      console.log("item", JSON.stringify(data.Item));
      if (err) {
        console.error(
          new Error(`Error getting userID from token: ${JSON.stringify(err)}`)
        );
        reject(err);
      } else if (
        data &&
        data.Item &&
        data.Item.Username &&
        data.Item.Username.S &&
        data.Item.ID &&
        data.Item.ID.S &&
        data.Item.Email &&
        data.Item.Email.S
      ) {
        console.info(`Successfully got username ${data.Item.Username.S}`);
        resolve({
          username: data.Item.Username.S,
          id: data.Item.ID.S,
          email: data.Item.Email.S
        });
      } else {
        console.log("data", data.Item);
        console.log("data", JSON.stringify(data.Item));
        // TODO: localize string
        reject(new ApolloError("Unknown error"));
      }
    });
  });
}