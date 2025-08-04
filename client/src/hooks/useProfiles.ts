import { useState, useEffect } from 'react';
import { Profile } from '../types/profile';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Load profiles from localStorage
    const savedProfiles = localStorage.getItem('voice-notes-profiles');
    const currentProfileId = localStorage.getItem('voice-notes-current-profile');
    
    if (savedProfiles) {
      const parsedProfiles = JSON.parse(savedProfiles);
      setProfiles(parsedProfiles);
      
      if (currentProfileId) {
        const profile = parsedProfiles.find((p: Profile) => p.id === currentProfileId);
        if (profile) {
          setCurrentProfile(profile);
        }
      }
    }
  }, []);

  const saveProfiles = (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('voice-notes-profiles', JSON.stringify(newProfiles));
  };

  const createProfile = (username: string, password?: string): Profile => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      username,
      password,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    const updatedProfiles = [...profiles, newProfile];
    saveProfiles(updatedProfiles);
    return newProfile;
  };

  const switchProfile = (profile: Profile, enteredPassword?: string): boolean => {
    if (profile.password && profile.password !== enteredPassword) {
      return false;
    }

    const updatedProfile = { ...profile, lastUsed: new Date().toISOString() };
    const updatedProfiles = profiles.map(p => 
      p.id === profile.id ? updatedProfile : p
    );
    
    saveProfiles(updatedProfiles);
    setCurrentProfile(updatedProfile);
    localStorage.setItem('voice-notes-current-profile', profile.id);
    return true;
  };

  const deleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    saveProfiles(updatedProfiles);
    
    // Clear profile-specific data
    localStorage.removeItem(`voice-notes-notes-${profileId}`);
    localStorage.removeItem(`voice-notes-saved-notes-${profileId}`);
    
    if (currentProfile?.id === profileId) {
      setCurrentProfile(null);
      localStorage.removeItem('voice-notes-current-profile');
    }
  };

  return {
    profiles,
    currentProfile,
    createProfile,
    switchProfile,
    deleteProfile
  };
}