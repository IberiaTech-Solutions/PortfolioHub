"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';
import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Collaboration } from "@/types";

export default function CollaborationVerification() {
  const [user, setUser] = useState<User | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }
      
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
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('collaborations')
        .select('*')
        .eq('collaborator_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborations((data as Collaboration[]) || []);
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
        return <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'declined':
        return <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-200">You need to be signed in to view collaboration requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5V22h2v-6h2v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.5-4.5A1.5 1.5 0 0 0 6 9H4.5c-.8 0-1.54.37-2.01.99L1.5 11.5V22H4v-6h2v6h1.5z"/>
            </svg>
            Professional Collaborations
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Collaboration
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent">
              Requests
            </span>
          </h1>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Manage collaboration requests from other professionals who want to showcase their work with you
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
          {collaborations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-semibold text-white mb-2">No collaboration requests yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                When someone includes you in their portfolio as a collaborator, their request will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {collaborations.map((collaboration) => (
                <div
                  key={collaboration.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/8 transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-base sm:text-lg">
                            {collaboration.collaborator_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-1">
                            {collaboration.collaborator_name}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${
                              collaboration.status === 'accepted'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : collaboration.status === 'declined'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {getStatusIcon(collaboration.status)}
                              <span>{getStatusText(collaboration.status)}</span>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-300">
                              {new Date(collaboration.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-white">Portfolio</p>
                            <p className="text-gray-200 text-xs sm:text-sm">Portfolio ID: {collaboration.portfolio_id}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-white">Project</p>
                            <p className="text-gray-200 text-xs sm:text-sm">{collaboration.project_title}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-white">Your Role</p>
                            <p className="text-gray-200 text-xs sm:text-sm">{collaboration.role}</p>
                          </div>
                        </div>
                        {collaboration.project_description && (
                          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-white/20">
                            <p className="text-gray-200 leading-relaxed text-xs sm:text-sm">
                              {collaboration.project_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {collaboration.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'accepted')}
                        className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      >
                        <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        Accept & Verify
                      </button>
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'declined')}
                        className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 border border-white/20 shadow-sm hover:shadow-md hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      >
                        <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        Decline
                      </button>
                    </div>
                  )}

                  {collaboration.status === 'accepted' && collaboration.verified_at && (
                    <div className="flex items-center gap-2 sm:gap-3 text-emerald-600 text-base sm:text-lg font-semibold bg-emerald-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200/50">
                      <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6" />
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
