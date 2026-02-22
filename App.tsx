
import React, { useState, useEffect } from 'react';
import { UserProfile, AnalysisResult, ViewState, Language, MealType, EntrySource, WeightEntry, MeasurementsEntry } from './types';
import { 
  getProfile, getHistory, saveHistoryItem, getLanguage, saveLanguage, deleteHistoryItem, updateHistoryItem, duplicateHistoryItem,
  getWeightHistory, saveWeightEntry, getMeasurementsHistory, saveMeasurementsEntry 
} from './services/storageService';
import { analyzeFoodImage } from './services/geminiService';
import { translations } from './services/translations';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import CameraCapture from './components/CameraCapture';
import AnalysisResultView from './components/AnalysisResult';
import ManualEntry from './components/ManualEntry';
import Navigation from './components/Navigation';
import HistoryView from './components/HistoryView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import BodyView from './components/BodyView';
import { Loader2, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('PROFILE_SETUP');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [language, setLanguage] = useState<Language>('ar'); 
  
  // Body Tracking State
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [measurementsHistory, setMeasurementsHistory] = useState<MeasurementsEntry[]>([]);

  // Single source of truth for selected date across Dashboard and Analytics
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Transient state for the scanning flow
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<Partial<AnalysisResult> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEntrySource, setCurrentEntrySource] = useState<EntrySource>(EntrySource.Camera);
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  const t = translations[language];

  useEffect(() => {
    // Load initial data
    const savedProfile = getProfile();
    const savedHistory = getHistory();
    const savedLang = getLanguage();
    const savedWeight = getWeightHistory();
    const savedMeas = getMeasurementsHistory();
    
    setLanguage(savedLang);

    if (savedProfile) {
      setProfile(savedProfile);
      setView('DASHBOARD');
    }
    setHistory(savedHistory);
    setWeightHistory(savedWeight);
    setMeasurementsHistory(savedMeas);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setView('DASHBOARD');
  };

  // Initiate capture flow
  const handleInitiateCapture = (date?: Date) => {
    setTargetDate(date || new Date());
    setView('CAMERA');
  };

  const handleInitiateManual = (date?: Date) => {
    setTargetDate(date || new Date());
    setView('MANUAL_ENTRY');
  };

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setIsAnalyzing(true);
    setCurrentEntrySource(EntrySource.Camera);
    setView('ANALYSIS_RESULT');

    try {
      const result = await analyzeFoodImage(imageSrc, language);
      setAnalysisData(result);
    } catch (error) {
      console.error("Analysis failed", error);
      alert(t.failedAnalysis);
      setView('DASHBOARD');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntryComplete = (data: any) => {
    setAnalysisData(data);
    setCurrentEntrySource(EntrySource.Manual);
    setCapturedImage(null);
    setView('ANALYSIS_RESULT');
  };

  const handleSaveAnalysis = (mealType: MealType) => {
    if (analysisData) {
        // Determine timestamp: Use targetDate (with current time) or now
        let timestamp = Date.now();
        if (targetDate) {
            const now = new Date();
            const d = new Date(targetDate);
            d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            timestamp = d.getTime();
        }

      const fullResult: AnalysisResult = {
        ...analysisData as any,
        id: crypto.randomUUID(),
        timestamp: timestamp,
        imageUrl: capturedImage || undefined,
        mealType: mealType,
        source: currentEntrySource
      };

      saveHistoryItem(fullResult);
      setHistory(prev => [fullResult, ...prev]);
      setAnalysisData(null);
      setCapturedImage(null);
      setTargetDate(null);
      setView('DASHBOARD');
    }
  };

  const handleDiscardAnalysis = () => {
    setAnalysisData(null);
    setCapturedImage(null);
    setTargetDate(null);
    setView('DASHBOARD');
  };

  // Single Source of Truth Delete Handler
  const handleDeleteEntry = (id: string) => {
    deleteHistoryItem(id); // Storage
    setHistory(prev => prev.filter(i => i.id !== id)); // State
  };

  const handleUpdateEntry = (item: AnalysisResult) => {
    updateHistoryItem(item);
    setHistory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const handleDuplicateEntry = (id: string, date: Date) => {
    const now = new Date();
    // Create new timestamp using the target date but current time
    const newDate = new Date(date);
    newDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    
    const newItem = duplicateHistoryItem(id, newDate.getTime());
    if (newItem) {
      setHistory(prev => [newItem, ...prev]);
    }
  };

  const handleSaveWeight = (entry: WeightEntry) => {
    saveWeightEntry(entry);
    setWeightHistory(getWeightHistory()); // Reload from storage to ensure sort order
    if (profile) {
       setProfile({...profile, weight: entry.weightKg}); // Sync local profile state
    }
  };

  const handleSaveMeasurements = (entry: MeasurementsEntry) => {
    saveMeasurementsEntry(entry);
    setMeasurementsHistory(getMeasurementsHistory());
  };

  const showNavigation = ['DASHBOARD', 'HISTORY', 'CALENDAR', 'ANALYTICS', 'BODY'].includes(view);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={language === 'ar' ? 'font-arabic' : 'font-sans'}>
      {view !== 'CAMERA' && view !== 'ANALYSIS_RESULT' && view !== 'MANUAL_ENTRY' && (
        <button 
          onClick={toggleLanguage}
          className="fixed top-4 right-4 z-50 bg-white/50 backdrop-blur-sm p-2 rounded-full shadow-sm text-slate-600 hover:bg-white transition rtl:right-auto rtl:left-4"
        >
          <span className="flex items-center gap-1 font-bold text-xs">
            <Globe size={16} />
            {language === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>
      )}

      {view === 'PROFILE_SETUP' && (
        <ProfileSetup onComplete={handleProfileComplete} language={language} />
      )}

      {view === 'CAMERA' && (
        <CameraCapture onCapture={handleCapture} onClose={() => setView('DASHBOARD')} />
      )}

      {view === 'MANUAL_ENTRY' && (
        <ManualEntry 
          language={language} 
          onAnalysisComplete={handleManualEntryComplete} 
          onCancel={() => setView('DASHBOARD')} 
        />
      )}

      {view === 'ANALYSIS_RESULT' && (
        <>
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
              <h2 className="text-xl font-bold text-slate-800">{t.analyzing}</h2>
          </div>
        )}
        
        {!isAnalyzing && analysisData && (
          <AnalysisResultView 
            result={analysisData as AnalysisResult} 
            language={language}
            onSave={handleSaveAnalysis} 
            onDiscard={handleDiscardAnalysis} 
          />
        )}
        </>
      )}

      {view === 'DASHBOARD' && profile && (
        <Dashboard 
          profile={profile} 
          history={history} 
          language={language}
          onOpenCamera={handleInitiateCapture} 
          onManualEntry={handleInitiateManual}
          onImageSelected={handleCapture}
          onDeleteHistoryItem={handleDeleteEntry}
          onUpdateHistoryItem={handleUpdateEntry}
          onDuplicateHistoryItem={handleDuplicateEntry}
          date={currentDate}
          onDateChange={setCurrentDate}
        />
      )}

      {view === 'HISTORY' && (
        <HistoryView 
          history={history} 
          language={language} 
          onDelete={(id) => { if(confirm(t.confirmDelete)) handleDeleteEntry(id) }} 
          onDuplicate={(id) => handleDuplicateEntry(id, new Date())}
        />
      )}

      {view === 'CALENDAR' && profile && (
        <CalendarView 
          history={history} 
          profile={profile} 
          language={language} 
        />
      )}

      {view === 'BODY' && profile && (
        <BodyView 
           profile={profile}
           weightHistory={weightHistory}
           measurementsHistory={measurementsHistory}
           language={language}
           onSaveWeight={handleSaveWeight}
           onSaveMeasurements={handleSaveMeasurements}
           selectedDate={currentDate}
        />
      )}

      {view === 'ANALYTICS' && profile && (
        <AnalyticsView 
          history={history} 
          profile={profile} 
          language={language}
          date={currentDate}
        />
      )}

      {showNavigation && (
        <Navigation 
          currentView={view} 
          onChangeView={setView} 
          language={language} 
        />
      )}
    </div>
  );
};

export default App;
