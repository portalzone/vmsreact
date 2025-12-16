import { useEffect } from 'react';

const Modal = ({ 
  title, 
  message, 
  onClose, 
  onConfirm, 
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 text-white',
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div 
          className="mb-6" 
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`px-4 py-2 rounded ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
