import { useState, useEffect } from 'react';
import { SavedNote } from '../types/profile';

export function useSavedNotes(profileId?: string) {
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const storageKey = profileId ? `voiceink-saved-notes-${profileId}` : 'voiceink-saved-notes';

  useEffect(() => {
    const loadNotes = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setSavedNotes(JSON.parse(saved));
        } else {
          setSavedNotes([]);
        }
      } catch (error) {
        console.error('Error loading saved notes:', error);
        setSavedNotes([]);
      }
    };

    loadNotes();
  }, [storageKey]);

  const saveNote = (content: string) => {
    if (!content.trim()) return;

    const newNote: SavedNote = {
      id: Date.now().toString(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      preview: content.trim().substring(0, 30) + (content.trim().length > 30 ? '...' : '')
    };

    const updatedNotes = [newNote, ...savedNotes];
    setSavedNotes(updatedNotes);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = savedNotes.filter(note => note.id !== noteId);
    setSavedNotes(updatedNotes);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
  };

  const clearAllNotes = () => {
    setSavedNotes([]);
    localStorage.removeItem(storageKey);
  };

  return {
    savedNotes,
    saveNote,
    deleteNote,
    clearAllNotes
  };
}