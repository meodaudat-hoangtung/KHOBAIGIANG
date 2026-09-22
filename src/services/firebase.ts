import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with persistent IndexedDB offline cache
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId || undefined);
} catch (e) {
  // If already initialized, fallback
  console.warn('Firestore already initialized or fallback needed', e);
  db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || undefined);
}

// Anonymous auth for frictionless multi-device collaboration
const auth = getAuth(app);
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth note (can continue in offline/public mode):', err?.message || err);
});

// Test connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info("Firestore client is running in offline persistent mode.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operation: OperationType;
  path: string | null;
  authInfo?: any;
}

export function handleFirestoreError(error: unknown, operation: OperationType, path: string | null): never {
  const err = error as { code?: string; message?: string };
  const errorInfo: FirestoreErrorInfo = {
    error: err?.message || String(error),
    operation,
    path
  };
  console.error('Firestore Error:', errorInfo);
  throw new Error(JSON.stringify(errorInfo));
}

export { app, db, auth };
