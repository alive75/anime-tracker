import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, LoginData, magicLinkSchema, MagicLinkData } from '../lib/schemas';
import { TvIcon } from '../components/icons';

type AuthMode = 'password' | 'magic-link';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('password');

    return (
        <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center mb-6">
                    <TvIcon className="h-10 w-10 text-brand-primary" />
                    <h1 className="text-3xl font-bold ml-3 text-white">Anime Tracker</h1>
                </div>
                <div className="bg-base-200 p-8 rounded-xl shadow-2xl">
                    <div className="mb-6 border-b border-base-300">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setMode('password')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${mode === 'password' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-white hover:border-gray-500'}`}>
                                Sign in with Password
                            </button>
                            <button onClick={() => setMode('magic-link')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${mode === 'magic-link' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-white hover:border-gray-500'}`}>
                                Sign in with Magic Link
                            </button>
                        </nav>
                    </div>
                    {mode === 'password' ? <PasswordForm /> : <MagicLinkForm />}
                </div>
            </div>
        </div>
    );
};

const PasswordForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const onSubmit = async (data: LoginData) => {
        setApiError(null);
        try {
            await login(data);
            navigate('/');
        } catch (error: any) {
            setApiError(error.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                    <input id="email" type="email" {...register('email')} className="w-full px-4 py-3 bg-base-300 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition" placeholder="you@example.com" />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                    <input id="password" type="password" {...register('password')} className="w-full px-4 py-3 bg-base-300 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition" placeholder="••••••••" />
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
                </div>
                {apiError && <p className="text-red-400 text-center text-sm">{apiError}</p>}
                <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/80 transition-colors disabled:bg-base-300 disabled:cursor-wait">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <p className="text-center text-sm text-text-secondary mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-brand-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </>
    );
}

const MagicLinkForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, getValues } = useForm<MagicLinkData>({ resolver: zodResolver(magicLinkSchema) });
    const { requestMagicLink, isLoading } = useAuth();
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (data: MagicLinkData) => {
        setApiError(null);
        setIsSuccess(false);
        try {
            await requestMagicLink(data.email);
            setIsSuccess(true);
        } catch (error: any) {
            setApiError(error.message || 'Could not send magic link. Please try again.');
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-green-400 mb-2">Link Sent!</h2>
                <p className="text-text-secondary">A sign-in link has been sent to <span className="font-bold text-text-primary">{getValues('email')}</span>. Please check your inbox.</p>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="magic-email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                    <input id="magic-email" type="email" {...register('email')} className="w-full px-4 py-3 bg-base-300 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition" placeholder="you@example.com" />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                </div>
                {apiError && <p className="text-red-400 text-center text-sm">{apiError}</p>}
                <p className="text-xs text-text-secondary text-center">We'll email you a magic link for a password-free sign-in. The link is valid for 15 minutes.</p>
                <button type="submit" disabled={isLoading} className="w-full bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary/80 transition-colors disabled:bg-base-300 disabled:cursor-wait">
                    {isLoading ? 'Sending...' : 'Send Magic Link'}
                </button>
            </form>
            <p className="text-center text-sm text-text-secondary mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-brand-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </>
    )
}

export default LoginPage;
