import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ScreenshotPreviewProps {
  websiteUrl: string;
  screenshotUrl?: string;
  onRemoveScreenshot?: () => void;
  generating?: boolean;
  editable?: boolean;
}

export default function ScreenshotPreview({ 
  websiteUrl, 
  screenshotUrl, 
  onRemoveScreenshot,
  generating = false,
  editable = false 
}: ScreenshotPreviewProps) {
  const [imageError, setImageError] = useState(false);

  if (!websiteUrl) {
    return null;
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PhotoIcon className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Website Preview</h3>
        {generating && (
          <div className="h-4 w-4 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      <div className="relative group">
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {screenshotUrl && !imageError ? (
            <div className="relative">
              <Image
                src={screenshotUrl}
                alt={`Preview of ${websiteUrl}`}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {editable && onRemoveScreenshot && (
                <button
                  onClick={onRemoveScreenshot}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gray-800/50">
              {generating ? (
                <div className="text-center">
                  <div className="h-8 w-8 border border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-400">Generating screenshot...</p>
                </div>
              ) : imageError ? (
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Failed to load screenshot</p>
                </div>
              ) : (
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No screenshot available</p>
                </div>
              )}
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  {websiteUrl}
                </p>
              </div>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                Visit Site
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
