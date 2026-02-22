
import React from 'react';
import { StudentRecord, FormativeAssessment } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BENCHMARKS } from '../constants';

interface StudentProfileProps {
  student: StudentRecord;
  onClose: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onClose }) => {
  const formative = student?.formativeAssessments || [];
  
  const chartData = formative.map(fa => ({
    name: fa.date ? new Date(fa.date).toLocaleDateString() : 'N/A',
    score: fa.score || 0
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {student?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{student?.name || 'Unknown Student'}</h2>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Student Literacy Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Benchmarks Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Comp', val: student?.composite, goal: BENCHMARKS.COMPOSITE },
              { label: 'LNF', val: student?.lnf, goal: BENCHMARKS.LNF },
              { label: 'PSF', val: student?.psf, goal: BENCHMARKS.PSF },
              { label: 'NWF-CLS', val: student?.nwfCls, goal: BENCHMARKS.NWF_CLS },
              { label: 'NWF-WRC', val: student?.nwfWrc, goal: BENCHMARKS.NWF_WRC },
              { label: 'WRF', val: student?.wrf, goal: BENCHMARKS.WRF },
              { label: 'ORF', val: student?.orf, goal: BENCHMARKS.ORF },
              { label: 'Accu', val: student?.orfAccuracy, goal: BENCHMARKS.ORF_ACC, unit: '%' }
            ].map(b => (
              <div key={b.label} className="p-2 rounded-lg border bg-white flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">{b.label}</span>
                <span className={`text-lg font-bold ${Number(b.val) >= b.goal ? 'text-green-600' : 'text-red-500'}`}>
                  {b.val ?? '-'}{b.unit && b.val !== null ? b.unit : ''}
                </span>
                <span className="text-[9px] text-gray-400">Goal: {b.goal}{b.unit}</span>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
              <i className="fas fa-chart-line text-blue-500"></i>
              <span>Formative Progress (Exit Tickets & Quizzes)</span>
            </h3>
            <div className="h-64 bg-gray-50 rounded-xl p-4 border border-gray-100">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-folder-open text-3xl mb-2"></i>
                  <p className="text-xs">No formative data available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Formative Feed */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
              <i className="fas fa-list-ul text-blue-500"></i>
              <span>Recent Assessments</span>
            </h3>
            <div className="space-y-3">
              {formative.length > 0 ? (
                [...formative].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(fa => (
                  <div key={fa.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${(fa.score || 0) >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <span className="font-bold text-sm">{fa.score}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{fa.skill}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{fa.type} • {fa.date ? new Date(fa.date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    {fa.notes && <p className="text-xs text-gray-500 max-w-xs italic text-right">"{fa.notes}"</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No exit tickets recorded. Use the "Scan Sample" feature to add formative assessments.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
