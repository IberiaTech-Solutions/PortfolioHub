import React from 'react';
import { ArrowTopRightOnSquareIcon, StarIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

interface Project {
  title: string;
  description: string;
  url: string;
  techStack: string[];
  stars?: number;
  forks?: number;
  language?: string;
  lastUpdated: string;
}

interface ProjectCardsProps {
  projects: Project[];
  onRemoveProject?: (index: number) => void;
  editable?: boolean;
}

export default function ProjectCards({ projects, onRemoveProject, editable = false }: ProjectCardsProps) {
  if (projects.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CodeBracketIcon className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Featured Projects</h3>
        <span className="text-sm text-gray-400">({projects.length})</span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {project.title}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  Updated {formatDate(project.lastUpdated)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {project.stars !== undefined && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <StarIcon className="h-4 w-4" />
                    <span className="text-sm">{project.stars}</span>
                  </div>
                )}
                {project.forks !== undefined && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <CodeBracketIcon className="h-4 w-4" />
                    <span className="text-sm">{project.forks}</span>
                  </div>
                )}
                {editable && onRemoveProject && (
                  <button
                    onClick={() => onRemoveProject(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {project.description}
            </p>

            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {project.language && (
                  <span className="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded-full">
                    {project.language}
                  </span>
                )}
              </div>
              
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                View Project
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
