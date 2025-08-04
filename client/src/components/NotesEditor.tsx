import React from 'react';
import { Trash2, Save } from 'lucide-react';

interface NotesEditorProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onClear: () => void;
  onSave: () => void;
  theme: 'light' | 'dark';
}

const NotesEditor: React.FC<NotesEditorProps> = ({ notes, onNotesChange, onClear, onSave, theme }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Your Notes
        </h2>
        <div className="flex items-center space-x-2">
          {notes && (
            <>
              <button
                onClick={onSave}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-blue-400' 
                    : 'hover:bg-gray-200 text-gray-500 hover:text-blue-500'
                }`}
                aria-label="Save notes"
              >
                <Save size={18} />
              </button>
              
              <button
                onClick={onClear}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-red-400' 
                    : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                }`}
                aria-label="Clear notes"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Your transcribed notes will appear here... You can also type directly."
        className={`w-full h-64 p-4 rounded-xl border resize-none transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-black placeholder-gray-500'
        }`}
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
      />
      
      {notes && (
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Character count: {notes.length}
        </div>
      )}
    </div>
  );
};

export default NotesEditor;