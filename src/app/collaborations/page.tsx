"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';
import { CheckIcon, XMarkIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
        return <CheckIcon className="h-5 w-5 text-green-400" />;
      case 'declined':
        return <XMarkIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-xl text-gray-300 font-medium">Loading collaboration requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-xl text-gray-300">You need to be signed in to view collaboration requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl py-12 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-purple-500/20 rounded-2xl">
              <UserGroupIcon className="h-12 w-12 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Collaboration
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Requests
              </span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Manage collaboration requests from other professionals who want to showcase their work with you
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {collaborations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <UserGroupIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Collaboration Requests</h3>
              <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                You haven't been tagged in any collaborations yet. When someone includes you in their portfolio, you'll see the request here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {collaborations.map((collaboration) => (
                <div
                  key={collaboration.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-white">
                          {collaboration.portfolios.name}
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                          {getStatusIcon(collaboration.status)}
                          <span className="text-sm font-semibold text-gray-300">{getStatusText(collaboration.status)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg text-gray-300">
                          <span className="font-semibold text-white">Portfolio:</span> {collaboration.portfolios.title}
                        </p>
                        <p className="text-lg text-gray-300">
                          <span className="font-semibold text-white">Project:</span> {collaboration.project_title}
                        </p>
                        <p className="text-lg text-gray-300">
                          <span className="font-semibold text-white">Your Role:</span> {collaboration.role}
                        </p>
                        {collaboration.project_description && (
                          <p className="text-gray-400 mt-3 leading-relaxed">
                            {collaboration.project_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {collaboration.status === 'pending' && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'accepted')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                      >
                        <CheckIcon className="h-5 w-5" />
                        Accept & Verify
                      </button>
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'declined')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Decline
                      </button>
                    </div>
                  )}

                  {collaboration.status === 'accepted' && collaboration.verified_at && (
                    <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
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
