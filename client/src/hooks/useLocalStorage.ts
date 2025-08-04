import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, profileId?: string) {
  const storageKey = profileId ? `${key}-${profileId}` : key;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${storageKey}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${storageKey}":`, error);
    }
  };

  // Update storage key when profileId changes
  useEffect(() => {
    const newStorageKey = profileId ? `${key}-${profileId}` : key;
    if (newStorageKey !== storageKey) {
      try {
        const item = window.localStorage.getItem(newStorageKey);
        const newValue = item ? JSON.parse(item) : initialValue;
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error reading localStorage key "${newStorageKey}":`, error);
        setStoredValue(initialValue);
      }
    }
  }, [profileId, key, initialValue]);

  return [storedValue, setValue] as const;
}