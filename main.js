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
    const { idToken } = JSON.parse(req.body);

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const googleData = await googleRes.json();

    if (googleData.error) {
      throw new Error('Invalid Google token');
    }

    const email = googleData.email;
    const name = googleData.name;

    let appwriteUser;
    const existing = await users.list({
      queries: [Query.equal("email", email)],
    });

    if (existing.total > 0) {
      appwriteUser = existing.users[0];
    } else {
      appwriteUser = await users.create(
        ID.unique(),
        email,
        "TempPassword123!", // placeholder, can be updated later
        name
      );

      await database.createDocument(
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
    }

    const jwt = await account.createJWT();
    return res.json({ jwt, user: appwriteUser });

  } catch (error) {
    log(error.message);
    return res.json({ error: error.message });
  }
};
