
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
  // Initialize students with empty formative array to satisfy new type
  const [students, setStudents] = useState<StudentRecord[]>(
    INITIAL_STUDENTS.map(s => ({ ...s, formativeAssessments: [] }))
  );
  const [analysis, setAnalysis] = useState<LiteracyAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'guide'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const handleAnalyze = async (data: StudentRecord[]) => {
    setIsLoading(true);
    try {
      const report = await analyzeLiteracyData(data);
      setAnalysis(report);
    } catch (error) {
      console.error("Error analyzing data:", error);
      alert("Analysis failed. Please check your data and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyze(students);
  }, []);

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
          <div className="text-sm font-medium bg-blue-800 px-3 py-1 rounded-full border border-blue-500 hidden sm:block">
            MTSS Tier 1-3 Support
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
