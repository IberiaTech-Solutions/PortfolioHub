"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';
import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Collaboration {
  id: string;
  portfolio_id: string;
  collaborator_user_id: string;
  collaborator_name: string;
  collaborator_email: string;
  project_title: string;
  project_description?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  verified_at?: string;
  created_at: string;
  portfolios: {
    title: string;
    name: string;
  };
}

export default function CollaborationVerification() {
  const [user, setUser] = useState<User | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchCollaborations(user.id);
      }
    };

    getUser();
  }, []);

  const fetchCollaborations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          portfolios!inner(title, name)
        `)
        .eq('collaborator_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborations(data || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCollaborationStatus = async (collaborationId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch('/api/collaborations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaborationId, status })
      });

      if (response.ok) {
        const { collaboration } = await response.json();
        setCollaborations(prev => 
          prev.map(c => c.id === collaborationId ? collaboration : c)
        );
      }
    } catch (error) {
      console.error('Error updating collaboration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'declined':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Verified';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-xl text-gray-600">You need to be signed in to view collaboration requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Waves */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-brand-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Dots */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-brand-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-32 w-2.5 h-2.5 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        
        {/* Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="network" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 10 20 M 0 10 L 20 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#network)" className="text-brand-400"/>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto py-16 px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-brand-200/50 rounded-full text-brand-700 text-sm font-medium mb-6 shadow-lg">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5V22h2v-6h2v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.5-4.5A1.5 1.5 0 0 0 6 9H4.5c-.8 0-1.54.37-2.01.99L1.5 11.5V22H4v-6h2v6h1.5z"/>
            </svg>
            Professional Collaborations
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
            Collaboration
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent">
              Requests
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Manage collaboration requests from other professionals who want to showcase their work with you
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
          {collaborations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5V22h2v-6h2v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.5-4.5A1.5 1.5 0 0 0 6 9H4.5c-.8 0-1.54.37-2.01.99L1.5 11.5V22H4v-6h2v6h1.5z"/>
                </svg>
              </div>
              <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">No Collaboration Requests</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                You haven&apos;t been tagged in any collaborations yet. When someone includes you in their portfolio, you&apos;ll see the request here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {collaborations.map((collaboration) => (
                <div
                  key={collaboration.id}
                  className="group bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {collaboration.portfolios.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-heading font-bold text-gray-900 mb-1">
                            {collaboration.portfolios.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
                              collaboration.status === 'accepted' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : collaboration.status === 'declined'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                              {getStatusIcon(collaboration.status)}
                              <span>{getStatusText(collaboration.status)}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(collaboration.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Portfolio</p>
                            <p className="text-gray-700">{collaboration.portfolios.title}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Project</p>
                            <p className="text-gray-700">{collaboration.project_title}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Your Role</p>
                            <p className="text-gray-700">{collaboration.role}</p>
                          </div>
                        </div>
                        {collaboration.project_description && (
                          <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                            <p className="text-gray-600 leading-relaxed">
                              {collaboration.project_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {collaboration.status === 'pending' && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'accepted')}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <CheckIcon className="h-5 w-5" />
                        Accept & Verify
                      </button>
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'declined')}
                        className="flex items-center gap-3 px-6 py-3 bg-white/80 hover:bg-white text-gray-700 rounded-xl font-semibold transition-all duration-300 border border-gray-200/50 shadow-sm hover:shadow-md hover:scale-105"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Decline
                      </button>
                    </div>
                  )}

                  {collaboration.status === 'accepted' && collaboration.verified_at && (
                    <div className="flex items-center gap-3 text-emerald-600 text-lg font-semibold bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/50">
                      <CheckIcon className="h-6 w-6" />
                      Verified on {new Date(collaboration.verified_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
