import { DALContext } from "./DALContext";

export function createRoute(
  ctx: DALContext,
  {
    to,
    redirectTo,
    userID
  }: {
    to: string;
    redirectTo: string;
    userID: string;
  }
) {
  const params = {
    TableName: "route",
    Item: {
      To: { S: to },
      RedirectTo: { S: redirectTo },
      UserID: { S: userID }
    }
  };

  return new Promise<void>((resolve, reject) => {
    ctx.ddb.putItem(params, function(err, data) {
      if (err) {
        console.error(
          new Error(`Error creating route ${to} for userID ${userID}: ${err}`)
        );
        reject(err);
      } else {
        console.info(`Successfully created route ${to} for userID ${userID}`);
        resolve();
      }
    });
  });
}
