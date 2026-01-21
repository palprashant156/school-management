'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">EduManage</span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Login
            </Link>
            <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Seamless <span className="text-indigo-600">User Management</span> <br className="hidden md:block" /> for Educational Inst.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Empower your institution with a secure, role-based platform for Admins, Teachers, and Students. Experience the future of education management today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
              Access Pilot
            </Link>
            <button className="bg-white text-indigo-600 border border-gray-200 px-8 py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Why EduManage?</h2>
              <p className="mt-4 text-gray-500">Built with security and scalability in mind.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Authentication</h3>
                <p className="text-gray-600">Industry-standard JWT authentication ensures your data stays safe and private.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  👥
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Role-Based Access</h3>
                <p className="text-gray-600">Tailored dashboards for Admins, Teachers, and Students for a focused experience.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Performance</h3>
                <p className="text-gray-600">Optimized for speed and reliability, handling thousands of users with ease.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2026 EduManage System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
