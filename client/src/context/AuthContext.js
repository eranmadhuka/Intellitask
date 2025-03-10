import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [additionalData, setAdditionalData] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedAdditionalData = localStorage.getItem('additionalData');

        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
            }
        }

        if (storedAdditionalData) {
            try {
                setAdditionalData(JSON.parse(storedAdditionalData));
            } catch (error) {
                console.error("Failed to parse additional data:", error);
            }
        }

        setLoading(false); // Set loading to false after attempting to fetch data
    }, []);

    const login = (userData, additionalData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('additionalData', JSON.stringify(additionalData));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        setCurrentUser(userData);
        setAdditionalData(additionalData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
        setAdditionalData(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, additionalData, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
