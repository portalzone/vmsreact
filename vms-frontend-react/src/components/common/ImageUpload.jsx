import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

const ImageUpload = ({ onUpload, accept = 'image/*', maxSize = 5, multiple = false, label = 'Upload Image' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!files.length) return;

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSizeBytes);
    
    if (invalidFiles.length > 0) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const validFiles = files.filter(file => {
      if (accept === 'image/*') {
        return file.type.startsWith('image/');
      }
      return true;
    });

    if (validFiles.length === 0) {
      toast.error('Invalid file type');
      return;
    }

    setUploading(true);

    try {
      if (multiple) {
        await onUpload(validFiles);
      } else {
        await onUpload(validFiles[0]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-2">{label}</p>
            <p className="text-sm text-gray-500 mb-1">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Max size: {maxSize}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;