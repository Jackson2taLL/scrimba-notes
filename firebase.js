import { initializeApp } from 'firebase/app';
// access the db in firebase app
import { getFirestore, collection } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAaaWCnhA45X7GGv15p9dSenBvVoysWsos',
  authDomain: 'react-notes-19cc5.firebaseapp.com',
  projectId: 'react-notes-19cc5',
  storageBucket: 'react-notes-19cc5.appspot.com',
  messagingSenderId: '813644508610',
  appId: '1:813644508610:web:88a393f21834377ebcfa5b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get an instance of the db
const db = getFirestore(app);
// access the collection from the db
export const notesCollection = collection(db, 'notes');
