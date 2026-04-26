import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../components/ui/field-1';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        email,
        password,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <Helmet>
        <title>Login | ZENO Compiler</title>
        <meta name="description" content="Sign in to your ZENO account to start compiling Figma designs to high-quality code." />
      </Helmet>
      {/* Left Panel */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-black">
        {/* Logo and Back Button */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </Link>
          <Link to="/" aria-label="home" className="flex items-center">
            <img src="/Z.png" alt="ZENO Logo" className="h-8" />
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 w-full items-center justify-center">
          <div className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <FieldGroup>
                {/* Header */}
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold text-white">
                    Sign in to your account
                  </h1>
                  <p className="text-zinc-400 text-sm text-balance">
                    Enter your email below to sign in to your account
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Email */}
                <Field>
                  <FieldLabel
                    htmlFor="email"
                    className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-zinc-600 focus-visible:border-zinc-600 rounded-[10px] h-11"
                  />
                </Field>

                {/* Password */}
                <Field>
                  <div className="flex items-center">
                    <FieldLabel
                      htmlFor="password"
                      className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                    >
                      Password
                    </FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-xs text-zinc-500 underline-offset-4 hover:text-white hover:underline transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-transparent border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-zinc-600 focus-visible:border-zinc-600 rounded-[10px] h-11"
                  />
                </Field>

                {/* Submit */}
                <Field>
                  <Button
                    type="submit"
                    className="w-full bg-white text-black font-bold hover:bg-zinc-200 rounded-[10px] h-11 transition-colors"
                  >
                    Sign In
                  </Button>
                </Field>

                <Field>
                  <FieldDescription className="text-center text-zinc-500 text-xs mt-2">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-white underline underline-offset-4 hover:text-zinc-300 transition-colors"
                    >
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel — Image Mockup */}
      <div className="relative hidden lg:block">
        <img
          src="/123.png"
          alt="ZENO Card"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;