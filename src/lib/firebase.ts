import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCrOU997v_O7e_y0SwEQjVEquqPjA6VBwI',
  authDomain: 'ai-prompt-10289.firebaseapp.com',
  projectId: 'ai-prompt-10289',
  storageBucket: 'ai-prompt-10289.firebasestorage.app',
  messagingSenderId: '839165548510',
  appId: '1:839165548510:web:b9de9e9307b5e6946daf4f',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
