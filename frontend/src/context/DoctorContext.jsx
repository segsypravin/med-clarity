import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { mapPlaceToDoctor } from '../utils/doctorUtils';
import config from '../config';

const DoctorContext = createContext();

export function DoctorProvider({ children }) {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userCoords, setUserCoords] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    const fetchNearbyDoctors = useCallback(async (lat, lng) => {
        // Avoid refetching if we have data from the last 15 minutes
        if (lastFetched && (Date.now() - lastFetched < 15 * 60 * 1000)) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = currentUser ? await currentUser.getIdToken() : '';
            const res = await fetch(`${config.API_BASE}/api/get-doctors?lat=${lat}&lng=${lng}`, {
                headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || t('doctors.fetch_error'));
            }

            const mapped = (data.results || []).map((place) =>
                mapPlaceToDoctor(place, lat, lng, t)
            );

            // Sort by distance (closest first)
            mapped.sort((a, b) => {
                const distA = parseFloat(a.distance) || Infinity;
                const distB = parseFloat(b.distance) || Infinity;
                return distA - distB;
            });

            setDoctors(mapped);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('[DoctorContext.fetchNearbyDoctors]', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser, t, lastFetched]);

    // Trigger geolocation and fetch as soon as user is authenticated
    useEffect(() => {
        if (currentUser && !userCoords) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUserCoords(coords);
                        fetchNearbyDoctors(coords.lat, coords.lng);
                    },
                    (err) => {
                        console.error('[Geolocation]', err.message);
                        setError(t('doctors.location_denied'));
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                setError(t('doctors.geolocation_error'));
            }
        }
    }, [currentUser, userCoords, fetchNearbyDoctors, t]);

    const value = {
        doctors,
        loading,
        error,
        userCoords,
        fetchNearbyDoctors,
        refresh: () => {
            if (userCoords) {
                setLastFetched(null);
                fetchNearbyDoctors(userCoords.lat, userCoords.lng);
            }
        }
    };

    return (
        <DoctorContext.Provider value={value}>
            {children}
        </DoctorContext.Provider>
    );
}

export function useDoctors() {
    const context = useContext(DoctorContext);
    if (!context) {
        throw new Error('useDoctors must be used within a DoctorProvider');
    }
    return context;
}
