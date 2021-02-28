import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// TODO before deplying to Heroku: config var https://devcenter.heroku.com/articles/config-vars#accessing-config-var-values-from-code

const app = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
});

export const db = app.firestore();
export const auth = app.auth();
export default app;
