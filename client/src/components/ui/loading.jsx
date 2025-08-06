import React from 'react';

// Spinner component
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// Loading overlay
export const LoadingOverlay = ({ children, isLoading, message = 'Loading...' }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Progress bar
export const ProgressBar = ({ progress = 0, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

// Loading button
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => (
  <button
    disabled={disabled || loading}
    className={`relative ${className}`}
    {...props}
  >
    {loading && (
      <Spinner size="sm" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    )}
    <span className={loading ? 'opacity-0' : ''}>
      {children}
    </span>
  </button>
);

// Infinite scroll loading
export const InfiniteScrollLoader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-2" />
      <p className="text-gray-600 text-sm">Loading more...</p>
    </div>
  </div>
);

// Page loading
export const PageLoader = ({ message = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Spinner size="xl" className="mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600">Please wait while we prepare your content</p>
    </div>
  </div>
);

// Content loading
export const ContentLoader = ({ 
  isLoading, 
  children, 
  skeleton: Skeleton,
  message = 'Loading content...'
}) => {
  if (isLoading) {
    return Skeleton ? <Skeleton /> : (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return children;
};

// Upload progress
export const UploadProgress = ({ progress, fileName, onCancel }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700 truncate">
        {fileName}
      </span>
      <span className="text-sm text-gray-500">{progress}%</span>
    </div>
    <ProgressBar progress={progress} className="mb-2" />
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">
        {progress === 100 ? 'Upload complete' : 'Uploading...'}
      </span>
      {progress < 100 && onCancel && (
        <button
          onClick={onCancel}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Cancel
        </button>
      )}
    </div>
  </div>
);

// Search loading
export const SearchLoader = () => (
  <div className="flex items-center space-x-2 text-gray-600">
    <Spinner size="sm" />
    <span className="text-sm">Searching...</span>
  </div>
);

// Form loading
export const FormLoader = ({ message = 'Saving...' }) => (
  <div className="flex items-center space-x-2 text-blue-600">
    <Spinner size="sm" />
    <span className="text-sm font-medium">{message}</span>
  </div>
);

// Image loading
export const ImageLoader = ({ src, alt, className = '', ...props }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image not found</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
};

// Loading states for different actions
export const ActionLoader = ({ action, loading, children }) => {
  const getMessage = () => {
    switch (action) {
      case 'login': return 'Signing in...';
      case 'register': return 'Creating account...';
      case 'upload': return 'Uploading...';
      case 'save': return 'Saving...';
      case 'delete': return 'Deleting...';
      case 'search': return 'Searching...';
      case 'filter': return 'Filtering...';
      default: return 'Loading...';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <Spinner size="sm" />
        <span className="text-sm font-medium">{getMessage()}</span>
      </div>
    );
  }

  return children;
};

export default {
  Spinner,
  LoadingOverlay,
  ProgressBar,
  LoadingButton,
  InfiniteScrollLoader,
  PageLoader,
  ContentLoader,
  UploadProgress,
  SearchLoader,
  FormLoader,
  ImageLoader,
  ActionLoader,
}; 