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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-lg text-gray-600">You need to be signed in to view collaboration requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-6">
            Collaboration
            <br />
            <span className="font-normal text-gray-700">Requests</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage collaboration requests from other professionals who want to showcase their work with you
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {collaborations.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-light text-gray-900 mb-4">No Collaboration Requests</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                You haven&apos;t been tagged in any collaborations yet. When someone includes you in their portfolio, you&apos;ll see the request here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {collaborations.map((collaboration) => (
                <div
                  key={collaboration.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-medium text-gray-900">
                          {collaboration.portfolios.name}
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 border border-gray-200">
                          {getStatusIcon(collaboration.status)}
                          <span className="text-sm font-medium text-gray-600">{getStatusText(collaboration.status)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-900">Portfolio:</span> {collaboration.portfolios.title}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-900">Project:</span> {collaboration.project_title}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-900">Your Role:</span> {collaboration.role}
                        </p>
                        {collaboration.project_description && (
                          <p className="text-gray-600 mt-3 leading-relaxed">
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
                        className="flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <CheckIcon className="h-5 w-5" />
                        Accept & Verify
                      </button>
                      <button
                        onClick={() => updateCollaborationStatus(collaboration.id, 'declined')}
                        className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors duration-200 border border-gray-200"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Decline
                      </button>
                    </div>
                  )}

                  {collaboration.status === 'accepted' && collaboration.verified_at && (
                    <div className="flex items-center gap-2 text-green-600 text-lg font-medium">
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
