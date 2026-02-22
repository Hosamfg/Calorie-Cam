
import { UserProfile, AnalysisResult, Language, WeightEntry, MeasurementsEntry } from '../types';

const PROFILE_KEY = 'calorie_cam_profile';
const HISTORY_KEY = 'calorie_cam_history';
const LANGUAGE_KEY = 'calorie_cam_language';
const WEIGHT_KEY = 'calorie_cam_weight_history';
const MEASUREMENTS_KEY = 'calorie_cam_measurements_history';

// --- Profile ---
export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

// --- History (Meals) ---
export const saveHistoryItem = (item: AnalysisResult): void => {
  const currentHistory = getHistory();
  const updatedHistory = [item, ...currentHistory];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const getHistory = (): AnalysisResult[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateHistoryItem = (updatedItem: AnalysisResult): void => {
  const currentHistory = getHistory();
  const index = currentHistory.findIndex(i => i.id === updatedItem.id);
  if (index !== -1) {
    currentHistory[index] = updatedItem;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
  }
};

export const deleteHistoryItem = (id: string): void => {
  const currentHistory = getHistory();
  // Filter out the item with the matching ID
  const updatedHistory = currentHistory.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const duplicateHistoryItem = (id: string, newTimestamp: number): AnalysisResult | null => {
  const currentHistory = getHistory();
  const itemToDuplicate = currentHistory.find(item => item.id === id);
  
  if (itemToDuplicate) {
    const newItem: AnalysisResult = {
      ...itemToDuplicate,
      id: crypto.randomUUID(),
      timestamp: newTimestamp
    };
    const updatedHistory = [newItem, ...currentHistory];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return newItem;
  }
  return null;
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

// --- Language ---
export const saveLanguage = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export const getLanguage = (): Language => {
  return (localStorage.getItem(LANGUAGE_KEY) as Language) || 'ar';
}

// --- Body Tracking (Weight) ---
export const getWeightHistory = (): WeightEntry[] => {
  const data = localStorage.getItem(WEIGHT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWeightEntry = (entry: WeightEntry): void => {
  const current = getWeightHistory();
  // Check if entry for date exists, update or add
  const existingIndex = current.findIndex(e => e.date === entry.date);
  let updated = [];
  if (existingIndex !== -1) {
    updated = [...current];
    updated[existingIndex] = entry;
  } else {
    updated = [entry, ...current];
  }
  // Sort by date descending
  updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
  
  // Update Profile Weight too
  const profile = getProfile();
  if (profile) {
    saveProfile({ ...profile, weight: entry.weightKg });
  }
};

// --- Body Tracking (Measurements) ---
export const getMeasurementsHistory = (): MeasurementsEntry[] => {
  const data = localStorage.getItem(MEASUREMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMeasurementsEntry = (entry: MeasurementsEntry): void => {
  const current = getMeasurementsHistory();
  const existingIndex = current.findIndex(e => e.date === entry.date);
  let updated = [];
  if (existingIndex !== -1) {
    updated = [...current];
    updated[existingIndex] = entry;
  } else {
    updated = [entry, ...current];
  }
  updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(updated));
};
