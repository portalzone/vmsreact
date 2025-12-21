import { useState } from 'react';

const ImageGallery = ({ images, onDelete, onSetPrimary, primaryImage, baseUrl }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (image) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    setDeleting(image);
    try {
      await onDelete(image);
    } finally {
      setDeleting(null);
    }
  };

  const handleSetPrimary = async (image) => {
    try {
      await onSetPrimary(image);
    } catch (error) {
      console.error('Failed to set primary:', error);
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${baseUrl}${image}`;
    }
    return image;
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => {
          const imageUrl = getImageUrl(image);
          const isPrimary = primaryImage === image;
          
          return (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg"
              style={{ borderColor: isPrimary ? '#3b82f6' : '#e5e7eb' }}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(imageUrl)}
                />
              </div>

              {/* Primary Badge */}
              {isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                  PRIMARY
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!isPrimary && onSetPrimary && (
                  <button
                    onClick={() => handleSetPrimary(image)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Set as primary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => handleDelete(image)}
                    disabled={deleting === image}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === image ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImageGallery;