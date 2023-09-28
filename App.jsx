import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Split from 'react-split';
// import { nanoid } from 'nanoid';
// onSnapshot listener listens for changes in the firestore database
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { notesCollection, db } from './firebase.js';

export default function App() {
  const [notes, setNotes] = useState([]);
  // OLD CODE accessing local storage for notes
  // () => JSON.parse(localStorage.getItem('notes')) || []);
  const [currentNoteId, setCurrentNoteId] = useState('');
  const [tempNoteText, setTempNoteText] = useState('');

  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0];

  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
  //   console.log('sorted Notes', sortedNotes);

  useEffect(() => {
    // OLD CODE using local storage
    //     localStorage.setItem('notes', JSON.stringify(notes));
    //   }, [notes]);

    //NEW CODE using firestore database from firebase
    const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
      //sync up our local notes array with the snapshot data
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotes(notesArr.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    // we don't want a listener to hang out in the background if someone closes tab (memory leak)
    // must return function to unsubscribe (clean up the side effects)
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentNoteId) {
      // the ? is optional chaining
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);

  useEffect(() => {
    if (currentNote) {
      setTempNoteText(currentNote.body);
    }
  }, [currentNote]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tempNoteText !== currentNote.body) {
        updateNote(tempNoteText);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [tempNoteText]);

  async function createNewNote() {
    const newNote = {
      //OLD CODE getting rid of nanoid
      //   id: nanoid(),
      body: "# Type your markdown note's title here",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // OLD CODE now using onSnapshot to set our notes array
    // setNotes((prevNotes) => [newNote, ...prevNotes]);
    // NEW CODE adding notes to firestore
    const newNoteRef = await addDoc(notesCollection, newNote);
    setCurrentNoteId(newNoteRef.id);
  }

  async function updateNote(text) {
    // OLD CODE
    // setNotes((oldNotes) => {
    //   const newArray = [];
    //   for (let i = 0; i < oldNotes.length; i++) {
    //     const oldNote = oldNotes[i];
    //     if (oldNote.id === currentNoteId) {
    //       // Put the most recently-modified note at the top
    //       newArray.unshift({ ...oldNote, body: text });
    //     } else {
    //       newArray.push(oldNote);
    //     }
    //   }
    //   return newArray;
    // });

    // NEW CODE
    const docRef = doc(db, 'notes', currentNoteId);
    // merge allows us to merge the updated object to the existing object
    await setDoc(
      docRef,
      { body: text, updatedAt: Date.now() },
      { merge: true }
    );
  }

  async function deleteNote(noteId) {
    // OLD CODE no longer need event as the first param
    // event.stopPropagation();
    // setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId));
    // import db, the name of the collection, and the id
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
  }

  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction='horizontal' className='split'>
          <Sidebar
            notes={sortedNotes}
            currentNote={currentNote}
            setCurrentNoteId={setCurrentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
          />
          <Editor
            tempNoteText={tempNoteText}
            setTempNoteText={setTempNoteText}
          />
        </Split>
      ) : (
        <div className='no-notes'>
          <h1>You have no notes</h1>
          <button className='first-note' onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
}
