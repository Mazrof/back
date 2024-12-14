import admin from "firebase-admin";
// eslint-disable-next-line @typescript-eslint/no-require-imports

admin.initializeApp({
  credential: admin.credential.cert(
    {
      privateKey:process.env.FIREBASE_NOTIFICATION_PRIVATE_KEY.replace(/\\n/g, '\n'),
      projectId: process.env.FIREBASE_NOTIFICATION_PROJECT_ID,
      clientEmail: process.env.FIREBASE_NOTIFICATION_CLIENT_EMAIL
    }
  )
})
