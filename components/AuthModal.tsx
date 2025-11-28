import React, { useState } from 'react';
import { X, Mail, User as UserIcon, ArrowRight, Loader } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user: User;
      if (isLogin) {
        user = await loginUser(email);
      } else {
        if (!name.trim()) throw new Error("Name is required");

        // Formspree Integration
        try {
          await fetch("https://formspree.io/f/mjkqonnr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: email,
              name: name,
              message: "New User Signup from Foodstagram Africa"
            })
          });
        } catch (formError) {
          console.error("Formspree submission failed", formError);
          // We continue even if Formspree fails, to allow the user to use the app
        }

        user = await registerUser(name, email);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-africa-earth/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header Image/Color */}
        <div className="h-32 bg-gradient-to-r from-africa-clay to-africa-accent relative p-6 flex justify-end flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-serif font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Join the Kitchen'}
          </h2>
          <p className="text-white/90 text-sm">
            {isLogin ? 'Sign in to access your cookbook' : 'Create an account to save recipes'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-africa-accent focus:ring-0 transition-colors outline-none"
                    placeholder="Chef John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-africa-accent focus:ring-0 transition-colors outline-none"
                  placeholder="chef@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-africa-earth text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all transform active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "New to Foodstagram?" : "Already have an account?"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="ml-2 font-bold text-africa-accent hover:underline"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;