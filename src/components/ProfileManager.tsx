import React, { useState } from 'react';
import { User, Plus, LogIn, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Profile } from '../types/profile';

interface ProfileManagerProps {
  profiles: Profile[];
  currentProfile: Profile | null;
  onCreateProfile: (username: string, password?: string) => Profile;
  onSwitchProfile: (profile: Profile, password?: string) => boolean;
  onDeleteProfile: (profileId: string) => void;
  theme: 'light' | 'dark';
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  currentProfile,
  onCreateProfile,
  onSwitchProfile,
  onDeleteProfile,
  theme
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('Username is required');
      return;
    }

    if (profiles.some(p => p.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setError('Username already exists');
      return;
    }

    const profile = onCreateProfile(
      newUsername.trim(),
      usePassword && newPassword ? newPassword : undefined
    );
    
    onSwitchProfile(profile);
    setShowCreateForm(false);
    setNewUsername('');
    setNewPassword('');
    setUsePassword(false);
    setError('');
  };

  const handleSwitchProfile = (profile: Profile) => {
    if (profile.password) {
      setShowPasswordForm(profile.id);
      setEnteredPassword('');
      setError('');
    } else {
      onSwitchProfile(profile);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = profiles.find(p => p.id === showPasswordForm);
    if (profile) {
      const success = onSwitchProfile(profile, enteredPassword);
      if (success) {
        setShowPasswordForm(null);
        setEnteredPassword('');
        setError('');
      } else {
        setError('Incorrect password');
      }
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    if (deleteConfirm === profileId) {
      onDeleteProfile(profileId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(profileId);
    }
  };

  if (showCreateForm) {
    return (
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          Create New Profile
        </h3>
        
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className={`w-full p-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-black placeholder-gray-500'
              }`}
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="usePassword"
              checked={usePassword}
              onChange={(e) => setUsePassword(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="usePassword" className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Add password protection
            </label>
          </div>

          {usePassword && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 pr-10 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-black placeholder-gray-500'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                ⚠️ This is not a secure account system. Passwords are stored locally.
              </p>
            </div>
          )}

          {error && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {error}
            </p>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Create Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewUsername('');
                setNewPassword('');
                setUsePassword(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showPasswordForm) {
    const profile = profiles.find(p => p.id === showPasswordForm);
    return (
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          Enter Password for {profile?.username}
        </h3>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className={`w-full p-3 pr-10 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-black placeholder-gray-500'
              }`}
              placeholder="Enter password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {error}
            </p>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(null);
                setEnteredPassword('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>
          Profiles
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
          aria-label="Create new profile"
        >
          <Plus size={18} />
        </button>
      </div>

      {profiles.length === 0 ? (
        <p className={`text-center py-8 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          No profiles yet. Create your first profile to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                currentProfile?.id === profile.id
                  ? theme === 'dark'
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                  : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User size={20} className={
                  currentProfile?.id === profile.id
                    ? 'text-blue-500'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } />
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    {profile.username}
                    {profile.password && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        Protected
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Last used: {new Date(profile.lastUsed).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {currentProfile?.id !== profile.id && (
                  <button
                    onClick={() => handleSwitchProfile(profile)}
                    className={`p-2 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-200 text-gray-500'
                    }`}
                    aria-label="Switch to profile"
                  >
                    <LogIn size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className={`p-2 rounded-full transition-colors ${
                    deleteConfirm === profile.id
                      ? 'bg-red-500 text-white'
                      : theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                  }`}
                  aria-label={deleteConfirm === profile.id ? 'Confirm delete' : 'Delete profile'}
                >
                  {deleteConfirm === profile.id ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileManager;</parameter>