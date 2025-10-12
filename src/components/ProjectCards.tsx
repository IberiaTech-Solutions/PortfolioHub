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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <CodeBracketIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
        <h3 className="text-base sm:text-lg font-medium text-white">Featured Projects</h3>
        <span className="text-xs sm:text-sm text-gray-300">({projects.length})</span>
      </div>
      
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 hover:bg-gray-100 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {project.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Updated {formatDate(project.lastUpdated)}
                </p>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                {project.stars !== undefined && (
                    <div className="flex items-center gap-1 text-yellow-600">
                    <StarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{project.stars}</span>
                  </div>
                )}
                {project.forks !== undefined && (
                    <div className="flex items-center gap-1 text-gray-500">
                    <CodeBracketIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{project.forks}</span>
                  </div>
                )}
                {editable && onRemoveProject && (
                  <button
                    onClick={() => onRemoveProject(index)}
                    className="text-red-600 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              {project.description}
            </p>

            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {project.techStack.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                {project.language && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                    {project.language}
                  </span>
                )}
              </div>
              
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-xs sm:text-sm font-medium px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-md w-full sm:w-auto"
              >
                View Project
                <ArrowTopRightOnSquareIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
