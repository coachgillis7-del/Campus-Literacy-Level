
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ClassHealth } from '../types';

interface DashboardProps {
  health: ClassHealth;
}

const Dashboard: React.FC<DashboardProps> = ({ health }) => {
  const data = [
    { name: 'Well Below', value: health.wellBelow, color: '#EF4444' }, // Red
    { name: 'Below', value: health.below, color: '#F59E0B' },      // Orange
    { name: 'At Benchmark', value: health.at, color: '#10B981' }, // Green
    { name: 'Above Benchmark', value: health.above, color: '#3B82F6' } // Blue
  ].filter(d => d.value > 0);

  const total = health.wellBelow + health.below + health.at + health.above;
  const atOrAbovePercent = Math.round(((health.at + health.above) / total) * 100) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <i className="fas fa-heartbeat text-red-500"></i>
          <span>Class Health Snapshot</span>
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Target Trajectory</h2>
          <div className="mb-6">
            <div className="flex justify-between items-end mb-1">
              <span className="text-3xl font-extrabold text-blue-600">{atOrAbovePercent}%</span>
              <span className="text-xs font-bold text-gray-400">CURRENT PROFICIENCY</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${atOrAbovePercent}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed italic">
            "Every 1st grader at benchmark by EOY requires precise intervention starting today."
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase">Critical Needs</p>
            <p className="text-xl font-bold text-red-600">{health.wellBelow}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase">At/Above</p>
            <p className="text-xl font-bold text-green-600">{health.at + health.above}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
