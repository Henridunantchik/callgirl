import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const SearchRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { countryCode } = useParams();

  useEffect(() => {
    // Get the search query from the URL
    const query = searchParams.get('q');
    
    // Build the redirect URL with all search parameters
    const redirectUrl = `/${countryCode}/escort/list?${searchParams.toString()}`;
    
    // Navigate to the escort list with search parameters
    navigate(redirectUrl, { replace: true });
  }, [navigate, searchParams, countryCode]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to search results...</p>
      </div>
    </div>
  );
};

export default SearchRedirect;
