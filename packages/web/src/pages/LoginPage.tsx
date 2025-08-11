import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, LoginData } from '../lib/schemas';
import { TvIcon } from '../components/icons';

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: LoginData) => {
    setApiError(null);
    try {
      await login(data);
      navigate('/');
    } catch (error) {
      setApiError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6">
          <TvIcon className="h-10 w-10 text-brand-primary" />
          <h1 className="text-3xl font-bold ml-3 text-white">Anime Tracker</h1>
        </div>
        <div className="bg-base-200 p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-6">Welcome Back</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-base-300 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-base-300 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>
            {apiError && <p className="text-red-400 text-center text-sm">{apiError}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/80 transition-colors disabled:bg-base-300 disabled:cursor-wait"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
