import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import ProfileManager from './components/ProfileManager';
import VoiceRecorder from './components/VoiceRecorder';
import NotesEditor from './components/NotesEditor';
import { useTheme } from './hooks/useTheme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProfiles } from './hooks/useProfiles';
import { useSavedNotes } from './hooks/useSavedNotes';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { profiles, currentProfile, createProfile, switchProfile, deleteProfile } = useProfiles();
  const [notes, setNotes] = useLocalStorage('voiceink-notes', '', currentProfile?.id);
  const { savedNotes, saveNote, deleteNote, clearAllNotes } = useSavedNotes(currentProfile?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);

  // Show profile manager if no current profile
  useEffect(() => {
    if (!currentProfile && profiles.length === 0) {
      setShowProfileManager(true);
    }
  }, [currentProfile, profiles.length]);

  const handleUsernameChange = (newUsername: string) => {
    if (currentProfile) {
      // Update the current profile's username
      const updatedProfiles = profiles.map(p => 
        p.id === currentProfile.id ? { ...p, username: newUsername } : p
      );
      localStorage.setItem('voiceink-profiles', JSON.stringify(updatedProfiles));
    }
  };
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setNotes(prev => {
      const newText = prev ? `${prev} ${transcript}` : transcript;
      return newText;
    });
  };

  const clearNotes = () => {
    setNotes('');
  };

  const handleSaveNotes = () => {
    if (notes.trim()) {
      saveNote(notes);
    }
  };

  const handleNoteSelect = (note: any) => {
    setNotes(note.content);
  };

  const handleProfileSwitch = (profile: any, password?: string) => {
    const success = switchProfile(profile, password);
    if (success) {
      setShowProfileManager(false);
    }
    return success;
  };

  const handleCreateProfile = (username: string, password?: string) => {
    const profile = createProfile(username, password);
    setShowProfileManager(false);
    return profile;
  };

  if (showProfileManager) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                VoiceInk
              </h1>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Create or select a profile to get started
              </p>
            </div>
            
            <ProfileManager
              profiles={profiles}
              currentProfile={currentProfile}
              onCreateProfile={handleCreateProfile}
              onSwitchProfile={handleProfileSwitch}
              onDeleteProfile={deleteProfile}
              theme={theme}
            />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 text-white' 
                    : 'hover:bg-gray-100 text-black'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        savedNotes={savedNotes}
        onNoteSelect={handleNoteSelect}
        onClearAll={clearAllNotes}
        theme={theme}
      />
      
      <Header 
        username={currentProfile?.username || 'User'}
        onUsernameChange={handleUsernameChange}
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setIsMenuOpen(true)}
        onProfileToggle={() => setShowProfileManager(true)}
      />
      
      <main className="flex flex-col items-center justify-center min-h-screen pt-16 pb-20 px-4">
        {showProfileManager ? (
          <div className="w-full max-w-md">
            <ProfileManager
              profiles={profiles}
              currentProfile={currentProfile}
              onCreateProfile={handleCreateProfile}
              onSwitchProfile={handleProfileSwitch}
              onDeleteProfile={deleteProfile}
              theme={theme}
            />
          </div>
        ) : (
          <div className={`w-full max-w-2xl rounded-2xl p-6 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'
          }`}>
            <NotesEditor
              notes={notes}
              onNotesChange={handleNotesChange}
              onClear={clearNotes}
              onSave={handleSaveNotes}
              theme={theme}
            />
            
            <div className="mt-6 flex justify-center">
              <VoiceRecorder
                onTranscriptUpdate={handleTranscriptUpdate}
                theme={theme}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;