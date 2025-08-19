import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { TvIcon } from '../components/icons';

const MagicLinkCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setErrorMessage('No verification token found. Please try again.');
            setStatus('error');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await api.post('/auth/magic-link/callback', { token });
                const { access_token } = response.data;

                loginWithToken(access_token);
                setStatus('success');
                navigate('/', { replace: true });

            } catch (error: any) {
                const message = error.response?.data?.message || 'An unknown error occurred.';
                setErrorMessage(`Failed to verify magic link: ${message}`);
                setStatus('error');
            }
        };

        verifyToken();
    }, [searchParams, navigate, loginWithToken]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
                        <h2 className="text-2xl font-bold text-text-primary">Verifying your magic link...</h2>
                        <p className="text-text-secondary">Please wait while we sign you in.</p>
                    </>
                );
            case 'error':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Failed</h2>
                        <p className="text-text-secondary mb-6">{errorMessage}</p>
                        <Link to="/login" className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/80 transition-colors">
                            Return to Login
                        </Link>
                    </>
                );
            case 'success':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-green-400">Success!</h2>
                        <p className="text-text-secondary">Redirecting you to the dashboard...</p>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md text-center">
                <div className="flex justify-center items-center mb-6">
                    <TvIcon className="h-10 w-10 text-brand-primary" />
                    <h1 className="text-3xl font-bold ml-3 text-white">Anime Tracker</h1>
                </div>
                <div className="bg-base-200 p-8 rounded-xl shadow-2xl">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default MagicLinkCallbackPage;

