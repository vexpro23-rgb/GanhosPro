// Fix: Import `React` to make its namespace available for type annotations.
import React, { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)): T {
  const savedValue = localStorage.getItem(key);
  if (savedValue !== null) {
    try {
      return JSON.parse(savedValue);
    } catch (error) {
      console.error('Error parsing JSON from localStorage', error);
      localStorage.removeItem(key);
    }
  }

  if (initialValue instanceof Function) {
    return initialValue();
  }
  return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => getValue(key, initialValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}