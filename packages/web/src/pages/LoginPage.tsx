import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { magicLinkSchema, MagicLinkData } from '../lib/schemas';
import { TvIcon } from '../components/icons';

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center mb-6">
                    <TvIcon className="h-10 w-10 text-brand-primary" />
                    <h1 className="text-3xl font-bold ml-3 text-white">Anime Tracker</h1>
                </div>
                <div className="bg-base-200 p-8 rounded-xl shadow-2xl">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                        <p className="text-text-secondary">Enter your email to receive a magic link</p>
                    </div>
                    <MagicLinkForm />
                </div>
            </div>
        </div>
    );
};


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
        </>
    )
}

export default LoginPage;
