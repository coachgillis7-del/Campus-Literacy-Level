
import React from 'react';
import { LiteracyAnalysisReport } from '../types';

interface ReportViewProps {
  analysis: LiteracyAnalysisReport;
}

const ReportView: React.FC<ReportViewProps> = ({ analysis }) => {
  const movements = analysis?.movementReport || [];
  const missingData = analysis?.missingDataStudents || [];

  return (
    <div className="space-y-6">
      {/* Student Movement Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-indigo-900 flex items-center space-x-2">
            <i className="fas fa-arrows-alt-h"></i>
            <span>Student Movement Report</span>
          </h2>
          <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded border border-indigo-200">WEEKLY UPDATE</span>
        </div>
        <div className="p-0">
          {movements.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Previous Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">New Focus</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Evidence-Based Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((move, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{move.student}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{move.previousGroup}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                      <i className="fas fa-chevron-right mr-2 text-xs"></i>
                      {move.newGroup}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 italic">"{move.reason}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-check-circle text-gray-300 text-4xl mb-4"></i>
              <p className="text-gray-500 font-medium">No students met movement criteria this week. Maintain current grouping focus.</p>
            </div>
          )}
        </div>
      </div>

      {/* Flags & Missing Data */}
      {missingData.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800 uppercase">Action Required: Incomplete Data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The following students require immediate benchmark assessment to accurately place them in MTSS tiers:</p>
                <ul className="list-disc list-inside mt-1 font-medium">
                  {missingData.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportView;
