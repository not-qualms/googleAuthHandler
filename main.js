import { Client, Account, Databases, Users, ID } from 'node-appwrite';

export default async({ req, res, log, error }) => {
  
  const client = new Client()
  const account = new Account(client);
  const database = new Databases(client);
  const users = new Users(client)

  client
    .setEndpoint('https://sfo.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject(process.env.PROJECT_ID) // Your project ID
    .setKey(process.env.API_KEY); // Your secret API key
  
  try {
    const {idToken} = JSON.parse(req.body)

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const googleData = await googleRes.json();

    if (googleData.error) {
      throw new Error('Invalid Google token');
    }

    const email = googleData.email;
    const name = googleData.name;

    try {
      let appwriteUser = await users.list({
        queries: [Query.equal("email", email)],
      });    
    } catch (error) {
      let appwriteUser =  await account.create({
        ID.unique(),
        email,
        "JSJSHJSJHSGJSHGSHJSG8989",
        name
      })

      await database.createDocument(
        process.env.DB_ID,
        process.env.USER_COLLECTION_ID,
        ID.unique(),
        {
          firstName: googleData.givenName,
          lastName: googleData.familyName,
          email: googleData.email,
          avatar: googleData.photo,
          accountId: ID.unique()
        }
      )
    }

    const account = new Account(client);
    const jwt = await account.createJWT();

    return res.json({ jwt, user: appwriteUser });

  } catch (error) {
    log(err.message);
    return res.json({ error: err.message });
  }
}
