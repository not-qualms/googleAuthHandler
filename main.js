import { Client, Account, Databases, Users, ID, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

  const account = new Account(client);
  const database = new Databases(client);
  const users = new Users(client);

  try {
    log(process.env.PROJECT_ID)
    log(process.env.DB_ID)
    log(process.env.USER_COLLECTION_ID)
    log("Incoming request body: " + req.body);
    
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    log("Parsed body: " + JSON.stringify(body, null, 2));

    const { idToken } = body;
    log("Extracted idToken: " + idToken);

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const googleData = await googleRes.json();
    log("Google token verification response: " + JSON.stringify(googleData, null, 2));

    if (googleData.error) {
      throw new Error(`Invalid Google token: ${googleData.error}`);
    }

    const email = googleData.email;
    const name = googleData.name;
    log("User info from Google: " + JSON.stringify({ email, name }, null, 2));

    let appwriteUser;
    const existing = await users.list([Query.equal("email", email)]);
    log("Appwrite users.list result: " + JSON.stringify(existing, null, 2));

    if (existing.total > 0) {
      appwriteUser = existing.users[0];
      log("Found existing Appwrite user: " + JSON.stringify(appwriteUser, null, 2));
    } else {
      log("No existing user, creating new one...");
      appwriteUser = await users.create(
        ID.unique(),
        email,
        "TempPassword123!",
        name
      );
      log("New Appwrite user created: " + JSON.stringify(appwriteUser, null, 2));

      const doc = await database.createDocument(
        process.env.DB_ID,
        process.env.USER_COLLECTION_ID,
        ID.unique(),
        {
          firstName: googleData.given_name,
          lastName: googleData.family_name,
          email: googleData.email,
          avatar: googleData.picture,
          accountId: appwriteUser.$id
        }
      );
      log("New user document created: " + JSON.stringify(doc, null, 2));
    }

    const jwt = await account.createJWT();
    log("Generated JWT: " + JSON.stringify(jwt, null, 2));

    return res.json({ jwt, user: appwriteUser });

  } catch (err) {
    log("Caught error: " + err.message);
    return res.json({ error: err.message });
  }
};
