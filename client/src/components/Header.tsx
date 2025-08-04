import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Menu, User } from 'lucide-react';

interface HeaderProps {
  username: string;
  onUsernameChange: (username: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMenuToggle: () => void;
  onProfileToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  username, 
  onUsernameChange, 
  theme, 
  onThemeToggle, 
  onMenuToggle, 
  onProfileToggle 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(username);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(username);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onUsernameChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(username);
      setIsEditing(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-black/90 backdrop-blur-md border-gray-800' 
        : 'bg-white/90 backdrop-blur-md border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className={`menu-toggle p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 text-black'
            }`}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className={`text-xl font-bold bg-transparent border-none outline-none ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
              style={{ width: `${Math.max(editValue.length * 0.6, 4)}rem` }}
            />
          ) : (
            <h1 
              onClick={handleEdit}
              className={`text-xl font-bold cursor-pointer hover:opacity-70 transition-opacity ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
            >
              {username}
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onProfileToggle}
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 text-black'
            }`}
            aria-label="Manage profiles"
          >
            <User size={20} />
          </button>
          
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 text-black'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;