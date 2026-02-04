
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileProcessed: (base64: string, type: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFileProcessed(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center space-y-3 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'}`}
    >
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm font-medium text-blue-600">Extracting data via AI...</p>
        </div>
      ) : (
        <>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fas fa-cloud-upload-alt text-xl"></i>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">Scan Student Samples</p>
            <p className="text-xs text-gray-500">Upload Exit Tickets, PDF Reports, or CSV data</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Or browse files
          </button>
        </>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,application/pdf,.csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
};

export default FileUpload;
