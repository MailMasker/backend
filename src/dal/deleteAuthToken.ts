import { DALContext } from "./DALContext";
import bcrypt from "bcrypt";

export function deleteAuthToken({ ddb }: DALContext, authToken: string) {
  const params = {
    TableName: "auth",
    Key: {
      AuthToken: {
        S: authToken
      }
    }
  };

  return new Promise<{ authToken: string; expires: number }>(
    (resolve, reject) => {
      ddb.deleteItem(params, function(err, data) {
        if (err) {
          console.error(new Error(`Error deleting auth token: ${err}`));
          reject(err);
        } else {
          console.info(`Successfully deleted auth token`);
          resolve();
        }
      });
    }
  );
}
