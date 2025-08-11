import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, RegisterData } from '../lib/schemas';
import { TvIcon } from '../components/icons';

const RegisterPage: React.FC = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: RegisterData) => {
    setApiError(null);
    try {
      await register(data);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setApiError('This email is already registered.');
      } else {
        setApiError('Registration failed. Please try again.');
      }
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
          {isSuccess ? (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-green-400 mb-4">Registration Successful!</h2>
                <p className="text-text-secondary">Redirecting you to the login page...</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-text-primary mb-6">Create an Account</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    {...formRegister('email')}
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
                    {...formRegister('password')}
                    className="w-full px-4 py-3 bg-base-300 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
                </div>
                {apiError && <p className="text-red-400 text-center text-sm">{apiError}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/80 transition-colors disabled:bg-base-300 disabled:cursor-wait"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-sm text-text-secondary mt-6">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-brand-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
