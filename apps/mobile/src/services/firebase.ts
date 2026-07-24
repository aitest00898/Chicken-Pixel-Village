import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectDataConnectEmulator, getDataConnect, type DataConnect } from 'firebase/data-connect';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { connectorConfig } from '@chicken-village/sql-connect';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

type CompleteFirebaseConfig = { [Key in keyof typeof config]: string };
function isCompleteFirebaseConfig(value: typeof config): value is CompleteFirebaseConfig {
  return Object.values(value).every((entry) => typeof entry === 'string' && entry.length > 0);
}

export const hasFirebaseConfig = isCompleteFirebaseConfig(config);
export const usingFirebaseEmulators = hasFirebaseConfig && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;
let dataConnect: DataConnect | null = null;

if (isCompleteFirebaseConfig(config)) {
  app = initializeApp(config);
  auth = getAuth(app);
  functions = getFunctions(app, 'asia-east1');
  dataConnect = getDataConnect(app, connectorConfig);
  if (usingFirebaseEmulators) {
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST ?? '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFunctionsEmulator(functions, host, 5001);
    connectDataConnectEmulator(dataConnect, host, 9399);
  }
}

export { app as firebaseApp, auth as firebaseAuth, functions as firebaseFunctions, dataConnect as firebaseDataConnect };
