import React, { useEffect } from 'react';
import { X, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { SavedNote } from '../types/profile';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  savedNotes: SavedNote[];
  onNoteSelect: (note: SavedNote) => void;
  onClearAll: () => void;
  theme: 'light' | 'dark';
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  savedNotes,
  onNoteSelect,
  onClearAll,
  theme
}) => {
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isOpen && !target.closest('.side-menu') && !target.closest('.menu-toggle')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleClearAll = () => {
    if (showClearConfirm) {
      onClearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        } ${theme === 'dark' ? 'bg-black' : 'bg-black'}`}
      />

      {/* Side Menu */}
      <div
        className={`side-menu fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark' 
            ? 'bg-black border-gray-800' 
            : 'bg-white border-gray-200'
        } border-r w-full md:w-80`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Saved Notes
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-white' 
                : 'hover:bg-gray-100 text-black'
            }`}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {savedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <FileText size={48} className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} />
              <p className={`text-center mt-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No saved notes yet. Your voice recordings will appear here.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {savedNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    onNoteSelect(note);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 border border-gray-800'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`font-medium text-sm mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    {note.preview}
                  </div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(note.timestamp)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedNotes.length > 0 && (
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            {showClearConfirm ? (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 text-sm ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  <AlertTriangle size={16} />
                  <span>Delete all {savedNotes.length} notes?</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-black'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleClearAll}
                className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-red-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-red-600'
                }`}
              >
                <Trash2 size={16} />
                <span>Clear All Notes</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;