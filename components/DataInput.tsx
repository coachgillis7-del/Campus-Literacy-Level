
import React, { useState } from 'react';
import { StudentRecord } from '../types';
import FileUpload from './FileUpload';
import { extractFormativeData, parseRosterFromMedia } from '../geminiService';

interface DataInputProps {
  students: StudentRecord[];
  isLoading: boolean;
  onUpdate: (data: StudentRecord[]) => void;
  onViewProfile: (student: StudentRecord) => void;
}

const DataInput: React.FC<DataInputProps> = ({ students, isLoading, onUpdate, onViewProfile }) => {
  const [editingData, setEditingData] = useState<StudentRecord[]>(students);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadType, setUploadType] = useState<'sample' | 'roster'>('sample');

  const handleValueChange = (index: number, field: keyof StudentRecord, value: any) => {
    const newData = [...editingData];
    if (field === 'name') {
      newData[index].name = value;
    } else {
      newData[index][field] = value === '' ? null : Number(value) as any;
    }
    setEditingData(newData);
  };

  const addStudent = () => {
    setEditingData([
      ...editingData,
      { 
        id: Math.random().toString(36).substr(2, 9), 
        name: '', 
        composite: null,
        lnf: null,
        psf: null, 
        nwfCls: null, 
        nwfWrc: null, 
        wrf: null, 
        orf: null, 
        orfAccuracy: null, 
        metAimLineWeeks: 0,
        formativeAssessments: []
      }
    ]);
  };

  const removeStudent = (index: number) => {
    if (confirm('Delete this student profile?')) {
      const newData = [...editingData];
      newData.splice(index, 1);
      setEditingData(newData);
    }
  };

  const handleFileProcessed = async (base64: string, type: string) => {
    setIsProcessingFile(true);
    try {
      if (uploadType === 'sample') {
        const result = await extractFormativeData(base64, type);
        const newData = [...editingData];
        const studentIdx = newData.findIndex(s => 
          s.name.toLowerCase().includes(result.studentName.toLowerCase()) || 
          result.studentName.toLowerCase().includes(s.name.toLowerCase())
        );
        
        const newAssessment = {
          id: Math.random().toString(36).substr(2, 9),
          date: result.assessment.date || new Date().toISOString(),
          type: 'Scanned Sample' as any,
          score: result.assessment.score || 0,
          skill: result.assessment.skill || 'Literacy Skill',
          notes: result.assessment.notes
        };

        if (studentIdx > -1) {
          newData[studentIdx].formativeAssessments.push(newAssessment);
        } else {
          newData.push({
            id: Math.random().toString(36).substr(2, 9),
            name: result.studentName,
            composite: null, lnf: null, psf: null, nwfCls: null, nwfWrc: null, wrf: null, orf: null, orfAccuracy: null,
            metAimLineWeeks: 0,
            formativeAssessments: [newAssessment]
          });
        }
        setEditingData(newData);
        onUpdate(newData); // Auto-analyze after adding formative sample
      } else {
        // ROSTER IMPORT
        const roster = await parseRosterFromMedia(base64, type);
        const newStudents: StudentRecord[] = roster.map(r => ({
          id: Math.random().toString(36).substr(2, 9),
          name: r.name || 'Unknown',
          composite: r.composite ?? null,
          lnf: r.lnf ?? null,
          psf: r.psf ?? null,
          nwfCls: r.nwfCls ?? null,
          nwfWrc: r.nwfWrc ?? null,
          wrf: r.wrf ?? null,
          orf: r.orf ?? null,
          orfAccuracy: r.orfAccuracy ?? null,
          metAimLineWeeks: 0,
          formativeAssessments: []
        }));

        setEditingData(newStudents);
        onUpdate(newStudents); // Auto-analyze after roster import
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process file. Ensure the content is readable.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Class Roster & mCLASS Data</h2>
              <p className="text-sm text-gray-500">Update scores to recalculate Tiers and Groups.</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={addStudent}
                disabled={isLoading}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">Add Student</span>
              </button>
              <button 
                onClick={() => onUpdate(editingData)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-200 flex items-center space-x-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Run Analysis</span>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Comp</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">LNF</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">PSF</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">CLS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ORF</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Profile</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Del</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editingData.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        value={student.name}
                        onChange={(e) => handleValueChange(idx, 'name', e.target.value)}
                        className="w-full border-transparent border hover:border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. John D."
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        value={student.composite ?? ''}
                        onChange={(e) => handleValueChange(idx, 'composite', e.target.value)}
                        className="w-12 border-gray-100 border rounded px-1 py-1 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        value={student.lnf ?? ''}
                        onChange={(e) => handleValueChange(idx, 'lnf', e.target.value)}
                        className="w-12 border-gray-100 border rounded px-1 py-1 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        value={student.psf ?? ''}
                        onChange={(e) => handleValueChange(idx, 'psf', e.target.value)}
                        className="w-12 border-gray-100 border rounded px-1 py-1 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        value={student.nwfCls ?? ''}
                        onChange={(e) => handleValueChange(idx, 'nwfCls', e.target.value)}
                        className="w-12 border-gray-100 border rounded px-1 py-1 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        value={student.orf ?? ''}
                        onChange={(e) => handleValueChange(idx, 'orf', e.target.value)}
                        className="w-12 border-gray-100 border rounded px-1 py-1 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => onViewProfile(student)}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-user-circle"></i>
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => removeStudent(idx)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {editingData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <i className="fas fa-users text-3xl mb-3 block"></i>
                      <p>Your roster is empty. Import a spreadsheet or add manually.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-md font-bold text-gray-800 mb-4">AI Import Center</h3>
            
            <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
              <button 
                onClick={() => setUploadType('sample')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${uploadType === 'sample' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fas fa-file-invoice mr-1"></i> Exit Ticket
              </button>
              <button 
                onClick={() => setUploadType('roster')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${uploadType === 'roster' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fas fa-table mr-1"></i> Full Roster
              </button>
            </div>

            <FileUpload onFileProcessed={handleFileProcessed} isLoading={isProcessingFile} />
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">
                {uploadType === 'sample' ? 'Scanning Exit Ticket' : 'Importing Spreadsheet'}
              </h4>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                {uploadType === 'sample' 
                  ? 'The AI will identify the student and add their score to their formative profile.' 
                  : 'Upload any spreadsheet or CSV. The AI will map columns to names and DIBELS scores automatically.'}
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-md">
            <h4 className="font-bold flex items-center space-x-2 mb-2">
              <i className="fas fa-lightbulb"></i>
              <span>Pro Tip</span>
            </h4>
            <p className="text-xs text-indigo-100 leading-relaxed">
              If your spreadsheet has complex headers like "Nonsense Word Fluency - CLS", don't worry! The AI is trained to understand educational abbreviations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInput;
