import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectDataConnectEmulator, getDataConnect, type DataConnect } from 'firebase/data-connect';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { connectFirestoreEmulator, initializeFirestore, type Firestore } from 'firebase/firestore';
import { connectFirestoreEmulator as connectFirestoreLiteEmulator, getFirestore as getFirestoreLite, type Firestore as FirestoreLite } from 'firebase/firestore/lite';
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
let firestore: Firestore | null = null;
let firestoreLite: FirestoreLite | null = null;
let archiveAuth: Auth | null = null;
let archiveFirestoreLite: FirestoreLite | null = null;

if (isCompleteFirebaseConfig(config)) {
  app = initializeApp(config);
  auth = getAuth(app);
  functions = getFunctions(app, 'asia-east1');
  dataConnect = getDataConnect(app, connectorConfig);
  firestore = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
  firestoreLite = getFirestoreLite(app);
  const archiveApp = initializeApp(config, 'market-archive');
  archiveAuth = getAuth(archiveApp);
  archiveFirestoreLite = getFirestoreLite(archiveApp);
  if (usingFirebaseEmulators) {
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST ?? '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectAuthEmulator(archiveAuth, `http://${host}:9099`, { disableWarnings: true });
    connectFunctionsEmulator(functions, host, 5001);
    connectDataConnectEmulator(dataConnect, host, 9399);
    connectFirestoreEmulator(firestore, host, 8080);
    connectFirestoreLiteEmulator(archiveFirestoreLite, host, 8080);
  }
}

export {
  app as firebaseApp,
  auth as firebaseAuth,
  functions as firebaseFunctions,
  dataConnect as firebaseDataConnect,
  firestore as firebaseFirestore,
  firestoreLite as firebaseFirestoreLite,
  archiveAuth as firebaseArchiveAuth,
  archiveFirestoreLite as firebaseArchiveFirestoreLite,
};
