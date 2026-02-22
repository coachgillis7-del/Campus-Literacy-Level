
import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from './constants';
import { StudentRecord, LiteracyAnalysisReport } from './types';
import { analyzeLiteracyData } from './geminiService';
import Dashboard from './components/Dashboard';
import DataInput from './components/DataInput';
import ReportView from './components/ReportView';
import InterventionGuide from './components/InterventionGuide';
import StudentProfile from './components/StudentProfile';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  // Initialize students with empty formative array to satisfy new type
  const [students, setStudents] = useState<StudentRecord[]>(
    INITIAL_STUDENTS.map(s => ({ ...s, formativeAssessments: [] }))
  );
  const [analysis, setAnalysis] = useState<LiteracyAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'guide'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsAuthChecking(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'google_oauth', 'width=500,height=600');
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  const handleSelectKey = async () => {
    try {
      // @ts-ignore - window.aistudio is injected by the platform
      await window.aistudio.openSelectKey();
    } catch (error) {
      console.error("Error opening key selector:", error);
    }
  };

  const handleAnalyze = async (data: StudentRecord[]) => {
    setIsLoading(true);
    try {
      const report = await analyzeLiteracyData(data);
      setAnalysis(report);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Error analyzing data:", error);
      alert("Analysis failed. Please check your data and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      handleAnalyze(students);
    }
  }, [user]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <i className="fas fa-graduation-cap text-4xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campus Literacy Lead AI</h1>
            <p className="text-gray-500 mt-2">Secure Teacher Login Required</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span>Sign in with Google</span>
          </button>
          <p className="text-xs text-gray-400">
            Access restricted to verified campus educators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-[60]">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <i className="fas fa-graduation-cap text-2xl"></i>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Campus Literacy Lead AI</h1>
              <p className="text-xs text-blue-100 uppercase tracking-widest font-semibold">1st Grade MTSS & DIBELS 8th</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-800 px-3 py-1 rounded-full border border-blue-500">
              <img src={user.picture} className="h-6 w-6 rounded-full" alt={user.name} />
              <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
              <button onClick={handleLogout} className="text-blue-300 hover:text-white transition-colors ml-2">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
            <button 
              onClick={handleSelectKey}
              className="text-xs font-bold bg-white text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors flex items-center space-x-1"
              title="Use your own Gemini API key to avoid rate limits"
            >
              <i className="fas fa-key"></i>
              <span>API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-[64px] z-50">
        <div className="container mx-auto flex overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[120px] py-4 px-4 text-sm font-medium flex items-center justify-center space-x-2 transition-all border-b-2 ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('input')}
            className={`flex-1 min-w-[120px] py-4 px-4 text-sm font-medium flex items-center justify-center space-x-2 transition-all border-b-2 ${activeTab === 'input' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
          >
            <i className="fas fa-database"></i>
            <span>Data & Scans</span>
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex-1 min-w-[120px] py-4 px-4 text-sm font-medium flex items-center justify-center space-x-2 transition-all border-b-2 ${activeTab === 'guide' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
          >
            <i className="fas fa-book-open"></i>
            <span>Intervention Guide</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {isLoading && !analysis ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Building literacy profiles...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && analysis && (
              <div className="space-y-8">
                <Dashboard health={analysis.classHealth} />
                <ReportView analysis={analysis} />
              </div>
            )}
            {activeTab === 'input' && (
              <DataInput 
                students={students} 
                isLoading={isLoading}
                onUpdate={(newStudents) => {
                  setStudents(newStudents);
                  handleAnalyze(newStudents);
                }}
                onViewProfile={(student) => setSelectedStudent(student)}
              />
            )}
            {activeTab === 'guide' && analysis && (
              <InterventionGuide analysis={analysis} />
            )}
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {selectedStudent && (
        <StudentProfile 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 space-y-4 md:space-y-0">
          <p>© 2024 Campus Literacy Lead AI • Individualized Student Growth Tracking</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Multimodal Analysis Active</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
