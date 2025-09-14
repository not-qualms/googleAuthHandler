// import { Client, Account, Databases } from 'node-appwrite';
// import crypto from 'crypto';

// // Node 18+ has global fetch, no need to import anything else

// export async function main(req, res) {
//   const { idToken, setPassword } = JSON.parse(req.payload);

//   // Validate Google token
//   const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
//   const googleUser = await googleRes.json();
//   if (!googleUser.email) return res.json({ error: 'Invalid Google token' });

//   const client = new Client()
//     .setEndpoint(process.env.APPWRITE_ENDPOINT)
//     .setProject(process.env.APPWRITE_PROJECT_ID)
//     .setKey(process.env.APPWRITE_API_KEY);

//   const account = new Account(client);
//   const database = new Databases(client);

//   const randomPassword = crypto.randomBytes(16).toString('hex');

//   let appwriteUser;
//   try {
//     appwriteUser = await account.create(googleUser.email, randomPassword, googleUser.name);
//   } catch (err) {
//     if (err.code === 409) appwriteUser = await account.get(googleUser.email);
//     else throw err;
//   }

//   if (setPassword) await account.updatePassword(randomPassword, setPassword);

//   const session = await account.createSession(
//     googleUser.email,
//     setPassword || randomPassword
//   );

//   await database.createDocument(
//     'usersCollectionId', 
//     crypto.randomUUID(),
//     {
//       email: googleUser.email,
//       firstName: googleUser.given_name,
//       lastName: googleUser.family_name,
//       googleId: googleUser.sub,
//       createdAt: new Date().toISOString(),
//     }
//   );

//   res.json({ user: appwriteUser, session });
// }

export default async({ req, res, log, error }) => {
  return res.send("Hello World");
}