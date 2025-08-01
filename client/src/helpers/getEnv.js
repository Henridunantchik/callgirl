export const getEvn = (envname) => {
    const env = import.meta.env
    // For API URLs, use relative paths that work with Vite proxy
    if (envname === 'VITE_API_BASE_URL') {
        return '/api'
    }
    // For Firebase, use a temporary placeholder
    if (envname === 'VITE_FIREBASE_API') {
        return 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    }
    return env[envname]
}