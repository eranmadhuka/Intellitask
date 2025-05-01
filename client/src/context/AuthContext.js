import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser({ ...parsedUser, token: storedToken });
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, additionalData) => {
        // Ensure userData and token are valid
        const token = userData.token || localStorage.getItem('token');
        if (!token) {
            console.error("No token available for login");
            return;
        }

        const userWithToken = { ...userData, token };
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', token);
        if (additionalData) {
            localStorage.setItem('additionalData', JSON.stringify(additionalData));
        }
        setCurrentUser(userWithToken);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('additionalData');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);