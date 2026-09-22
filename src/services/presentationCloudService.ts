import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Presentation } from '../types/presentation';
import { DEFAULT_PRESENTATION } from '../data/defaultLectures';

export const CLIENT_ID = `client_${Math.random().toString(36).substring(2, 9)}`;

export interface CloudPresentationDoc {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  themeId: string;
  author: string;
  subject?: string;
  grade?: string;
  slidesJson: string;
  updatedAt: string;
  createdAt: string;
  lastEditorClientId?: string;
}

/**
 * Converts a Presentation object to a cloud-safe Firestore document
 */
export function presentationToCloudDoc(p: Presentation): CloudPresentationDoc {
  return {
    id: p.id,
    title: p.title || 'Bài giảng không tên',
    aspectRatio: p.aspectRatio || '16:9',
    themeId: p.themeId || 'modern-red',
    author: p.author || 'Giáo viên',
    subject: p.subject || '',
    grade: p.grade || '',
    slidesJson: JSON.stringify(p.slides || []),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lastEditorClientId: CLIENT_ID
  };
}

/**
 * Converts a Cloud document back into a Presentation object
 */
export function cloudDocToPresentation(docData: any): Presentation | null {
  try {
    if (!docData || !docData.id) return null;
    let slides = [];
    if (typeof docData.slidesJson === 'string') {
      slides = JSON.parse(docData.slidesJson);
    } else if (Array.isArray(docData.slides)) {
      slides = docData.slides;
    }

    return {
      id: docData.id,
      title: docData.title || 'Bài giảng',
      subject: docData.subject || '',
      grade: docData.grade || '',
      author: docData.author || 'Giáo viên',
      aspectRatio: docData.aspectRatio || '16:9',
      themeId: docData.themeId || docData.theme || 'modern-red',
      slides: slides,
      updatedAt: docData.updatedAt || new Date().toISOString()
    };
  } catch (e) {
    console.error('Error parsing cloud presentation document', e);
    return null;
  }
}

/**
 * Saves a presentation to the shared cloud database (preserves offline & online)
 */
export async function savePresentationToCloud(presentation: Presentation): Promise<void> {
  const docRef = doc(db, 'presentations', presentation.id);
  const data = presentationToCloudDoc(presentation);
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `presentations/${presentation.id}`);
  }
}

/**
 * Saves the global active presentation ID to system state
 */
export async function setActivePresentationIdInCloud(presentationId: string): Promise<void> {
  const docRef = doc(db, 'system', 'state');
  try {
    await setDoc(docRef, {
      activePresentationId: presentationId,
      updatedAt: new Date().toISOString(),
      lastEditorClientId: CLIENT_ID
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system/state');
  }
}

/**
 * Deletes a presentation from the cloud repository
 */
export async function deletePresentationFromCloud(presentationId: string): Promise<void> {
  const docRef = doc(db, 'presentations', presentationId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `presentations/${presentationId}`);
  }
}

/**
 * Listens to the entire library of presentations in real-time.
 * Synchronizes unified presentations across any device, anywhere.
 */
export function subscribeToCloudLibrary(
  onLibraryUpdate: (presentations: Presentation[]) => void
): () => void {
  const collRef = collection(db, 'presentations');

  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const list: Presentation[] = [];
      snapshot.forEach((docSnap) => {
        const item = cloudDocToPresentation(docSnap.data());
        if (item) list.push(item);
      });

      // If cloud is completely empty on initial first launch, seed the default presentation
      if (list.length === 0 && !snapshot.metadata.fromCache) {
        savePresentationToCloud(DEFAULT_PRESENTATION).catch(console.error);
        setActivePresentationIdInCloud(DEFAULT_PRESENTATION.id).catch(console.error);
        onLibraryUpdate([DEFAULT_PRESENTATION]);
        return;
      }

      onLibraryUpdate(list);
    },
    (error) => {
      console.warn('Realtime cloud library listener error (fallback to local cache):', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Listens to global system state (which presentation is currently active)
 */
export function subscribeToCloudActiveState(
  onActiveStateUpdate: (activeId: string, lastEditorClientId?: string) => void
): () => void {
  const docRef = doc(db, 'system', 'state');

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.activePresentationId) {
          onActiveStateUpdate(data.activePresentationId, data.lastEditorClientId);
        }
      }
    },
    (error) => {
      console.warn('Realtime cloud active state listener error:', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates for a single presentation by ID
 */
export function subscribeToSinglePresentation(
  presentationId: string,
  onUpdate: (presentation: Presentation, isLocalChange: boolean) => void
): () => void {
  const docRef = doc(db, 'presentations', presentationId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const p = cloudDocToPresentation(data);
        if (p) {
          const isLocal = data.lastEditorClientId === CLIENT_ID;
          onUpdate(p, isLocal);
        }
      }
    },
    (error) => {
      console.warn(`Realtime presentation listener error for ${presentationId}:`, error.message);
    }
  );

  return unsubscribe;
}

/**
 * Fetches a single presentation directly from Firestore
 */
export async function fetchPresentationFromCloud(presentationId: string): Promise<Presentation | null> {
  try {
    const docRef = doc(db, 'presentations', presentationId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return cloudDocToPresentation(snap.data());
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching presentation ${presentationId} from cloud:`, error);
    return null;
  }
}

/**
 * Fetches the currently active presentation from cloud system state
 */
export async function fetchActivePresentationFromCloud(): Promise<Presentation | null> {
  try {
    const stateDocRef = doc(db, 'system', 'state');
    const stateSnap = await getDoc(stateDocRef);
    if (stateSnap.exists()) {
      const activeId = stateSnap.data()?.activePresentationId;
      if (activeId && activeId !== 'test-123') {
        return await fetchPresentationFromCloud(activeId);
      }
    }
    return null;
  } catch (error) {
    console.warn('Error fetching active presentation from cloud state:', error);
    return null;
  }
}

