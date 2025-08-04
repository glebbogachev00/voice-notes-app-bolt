export interface Profile {
  id: string;
  username: string;
  password?: string;
  createdAt: string;
  lastUsed: string;
}

export interface SavedNote {
  id: string;
  content: string;
  timestamp: string;
  preview: string;
}</parameter>