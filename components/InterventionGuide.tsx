
import React, { useState } from 'react';
import { LiteracyAnalysisReport, GroupAnalysis, LessonPlan } from '../types';

interface InterventionGuideProps {
  analysis: LiteracyAnalysisReport;
}

const LessonCard: React.FC<{ lesson: LessonPlan, index: number }> = ({ lesson, index }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
    <h4 className="text-sm font-bold text-blue-700 mb-3 border-b border-blue-100 pb-1">
      Lesson {index + 1}: {lesson.title}
    </h4>
    <div className="space-y-3 text-xs">
      <div>
        <span className="font-bold text-gray-700 inline-block w-24">Warm-up (2m):</span>
        <span className="text-gray-600">{lesson.warmUp}</span>
      </div>
      <div>
        <span className="font-bold text-gray-700 inline-block w-24">Model (5m):</span>
        <span className="text-gray-600">{lesson.explicitModel}</span>
      </div>
      <div>
        <span className="font-bold text-gray-700 inline-block w-24">Practice (5m):</span>
        <span className="text-gray-600">{lesson.guidedPractice}</span>
      </div>
      <div>
        <span className="font-bold text-gray-700 inline-block w-24">Check (3m):</span>
        <span className="text-gray-600">{lesson.checkUnderstaning}</span>
      </div>
    </div>
  </div>
);

const GroupSection: React.FC<{ group: GroupAnalysis }> = ({ group }) => {
  const [isOpen, setIsOpen] = useState(true);
  const studentList = group?.students || [];
  const lessonList = group?.lessons || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className={`h-3 w-3 rounded-full ${group.groupId.includes('Group 1') ? 'bg-red-500' : group.groupId.includes('Group 2') ? 'bg-orange-500' : group.groupId.includes('Group 3') ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          <h3 className="text-md font-bold text-gray-800">{group.groupId}</h3>
          <span className="text-xs text-gray-400 font-medium">({studentList.length} Students)</span>
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400`}></i>
      </button>
      
      {isOpen && (
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Student Roster</p>
              <div className="flex flex-wrap gap-2">
                {studentList.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Teacher Action</p>
              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 leading-relaxed italic">
                {group.teacherAction}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Weekly Quick-Start Lessons (15 min each)</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {lessonList.map((lesson, i) => (
                <LessonCard key={i} lesson={lesson} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InterventionGuide: React.FC<InterventionGuideProps> = ({ analysis }) => {
  const groups = analysis?.groupings || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Weekly Intervention Guide</h2>
          <p className="text-gray-500">Actionable instructional plans based on the latest DIBELS data.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-bold"
        >
          <i className="fas fa-print"></i>
          <span>Print Guide</span>
        </button>
      </div>

      <div className="space-y-2">
        {groups.map((group, idx) => (
          <GroupSection key={idx} group={group} />
        ))}
      </div>

      <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-1">Campus Goal: 100% Benchmark</h3>
          <p className="text-blue-100 max-w-md">Small groups are the engine of literacy growth. Ensure explicit modeling and high repetitions in every session.</p>
        </div>
        <div className="flex -space-x-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center font-bold text-xs">
              <i className="fas fa-star text-yellow-300"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterventionGuide;
