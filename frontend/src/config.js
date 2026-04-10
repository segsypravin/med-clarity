const config = {
    // In local development, the backend is likely on port 5000.
    // In production, we'll assume the frontend and backend are on the same origin.
    API_BASE: import.meta.env.MODE === 'development' 
        ? 'http://localhost:5000' 
        : window.location.origin
};

export default config;
