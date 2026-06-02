
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
export interface InitialDataResponse {
    [key: string]: any;
}

interface InitialDataContextType {
    data: InitialDataResponse | null;
    loading: boolean;
    error: any;
    refresh: () => Promise<void>;
}

const InitialDataContext = createContext<InitialDataContextType | undefined>(undefined);

export const InitialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<InitialDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const slug = localStorage.getItem('tenantSlug');
            
            // Only fetch if we have a token and slug (logged in)
            if (!token || !slug) {
                setLoading(false);
                return;
            }

            const res = await api.get('/initial-data');
            setData(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    return (
        <InitialDataContext.Provider value={{ data, loading, error, refresh: fetchInitialData }}>
            {children}
        </InitialDataContext.Provider>
    );
};

export const useInitialData = () => {
    const context = useContext(InitialDataContext);
    if (context === undefined) {
        throw new Error('useInitialData must be used within an InitialDataProvider');
    }
    return context;
};
