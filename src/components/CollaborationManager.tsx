import React, { useState } from 'react';
import { UserGroupIcon, PlusIcon, XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Collaboration {
  id: string;
  collaborator_name: string;
  collaborator_email: string;
  project_title: string;
  project_description?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  verified_at?: string;
  created_at: string;
}

interface CollaborationManagerProps {
  portfolioId: string;
  collaborations: Collaboration[];
  onCollaborationsChange: (collaborations: Collaboration[]) => void;
}

export default function CollaborationManager({ 
  portfolioId, 
  collaborations, 
  onCollaborationsChange 
}: CollaborationManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCollaboration, setNewCollaboration] = useState({
    collaboratorName: '',
    collaboratorEmail: '',
    projectTitle: '',
    projectDescription: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAddCollaboration = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding collaboration:', { portfolioId, newCollaboration });
    console.log('PortfolioId type:', typeof portfolioId, 'Length:', portfolioId?.length);
    
    if (!newCollaboration.collaboratorName || !newCollaboration.collaboratorEmail || 
        !newCollaboration.projectTitle || !newCollaboration.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (!portfolioId || portfolioId.trim() === '') {
      // For new portfolios, we'll store collaborations locally until portfolio is saved
      console.log('No portfolio ID - storing collaboration locally');
      const tempCollaboration = {
        id: `temp-${Date.now()}`,
        collaborator_name: newCollaboration.collaboratorName,
        collaborator_email: newCollaboration.collaboratorEmail,
        project_title: newCollaboration.projectTitle,
        project_description: newCollaboration.projectDescription,
        role: newCollaboration.role,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        verified_at: undefined
      };
      
      onCollaborationsChange([...collaborations, tempCollaboration]);
      setNewCollaboration({
        collaboratorName: '',
        collaboratorEmail: '',
        projectTitle: '',
        projectDescription: '',
        role: ''
      });
      setIsAdding(false);
      alert('Collaboration added! It will be saved when you create your portfolio.');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending request to API with:', {
        portfolioId,
        ...newCollaboration
      });
      
      const response = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId,
          ...newCollaboration
        })
      });

      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const { collaboration } = await response.json();
        console.log('Collaboration added successfully:', collaboration);
        onCollaborationsChange([...collaborations, collaboration]);
        setNewCollaboration({
          collaboratorName: '',
          collaboratorEmail: '',
          projectTitle: '',
          projectDescription: '',
          role: ''
        });
        setIsAdding(false);
        alert('Collaboration added successfully!');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to add collaboration'}`);
      }
    } catch (error) {
      console.error('Error adding collaboration:', error);
      alert('Failed to add collaboration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaboration = async (collaborationId: string) => {
    try {
      const response = await fetch(`/api/collaborations?id=${collaborationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onCollaborationsChange(collaborations.filter(c => c.id !== collaborationId));
      }
    } catch (error) {
      console.error('Error removing collaboration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckIcon className="h-4 w-4 text-green-400" />;
      case 'declined':
        return <XMarkIcon className="h-4 w-4 text-red-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-400" />;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-gray-300" />
          <h3 className="text-lg font-medium text-white">Collaborated With</h3>
          <span className="text-sm text-gray-300">({collaborations.length})</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add Collaboration button clicked');
            setIsAdding(true);
          }}
          className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/20"
        >
          <PlusIcon className="h-4 w-4" />
          Add Collaboration
        </button>
      </div>

      {/* Add Collaboration Form */}
      {isAdding && (
        <div className="bg-white/10 border border-white/20 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Collaborator Name"
              value={newCollaboration.collaboratorName}
              onChange={(e) => setNewCollaboration(prev => ({ ...prev, collaboratorName: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Collaborator Email"
              value={newCollaboration.collaboratorEmail}
              onChange={(e) => setNewCollaboration(prev => ({ ...prev, collaboratorEmail: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Project Title"
            value={newCollaboration.projectTitle}
            onChange={(e) => setNewCollaboration(prev => ({ ...prev, projectTitle: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Your Role (e.g., Frontend Developer, Designer)"
            value={newCollaboration.role}
            onChange={(e) => setNewCollaboration(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            placeholder="Project Description (optional)"
            value={newCollaboration.projectDescription}
            onChange={(e) => setNewCollaboration(prev => ({ ...prev, projectDescription: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddCollaboration}
              disabled={loading}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Collaboration'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collaborations List */}
      {collaborations.length > 0 && (
        <div className="space-y-3">
          {collaborations.map((collaboration) => (
            <div
              key={collaboration.id}
              className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-white">{collaboration.collaborator_name}</h4>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(collaboration.status)}
                      <span className="text-sm text-gray-300">{getStatusText(collaboration.status)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 mb-1">{collaboration.project_title}</p>
                  <p className="text-sm text-gray-300 mb-2">Role: {collaboration.role}</p>
                  {collaboration.project_description && (
                    <p className="text-sm text-gray-300">{collaboration.project_description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCollaboration(collaboration.id)}
                  className="text-red-600 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {collaborations.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-300">
          <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No collaborations yet</p>
          <p className="text-sm">Add collaborators to build your professional network</p>
        </div>
      )}
    </div>
  );
}
