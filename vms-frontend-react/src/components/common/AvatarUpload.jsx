import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

const AvatarUpload = ({ currentAvatar, onUpload, onDelete, userName = 'User' }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;
    
    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Avatar delete error:', error);
      toast.error('Failed to delete avatar');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative">
        {/* Avatar Display */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-white">
              {getInitials()}
            </span>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload photo"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Delete Button */}
      {currentAvatar && onDelete && (
        <button
          onClick={handleDelete}
          disabled={uploading || deleting}
          className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {deleting ? 'Removing...' : 'Remove Photo'}
        </button>
      )}

      <p className="text-sm text-gray-500 mt-2 text-center">
        Click the camera icon to upload
        <br />
        <span className="text-xs">Max size: 5MB</span>
      </p>
    </div>
  );
};

export default AvatarUpload;