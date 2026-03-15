"use client";

import { useState, useRef } from "react";

interface VideoIntroProps {
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
  editable?: boolean;
}

export default function VideoIntro({ videoUrl, onVideoChange, editable = false }: VideoIntroProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(videoUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Video must be under 50MB");
      return;
    }

    setUploading(true);
    try {
      // Create a local preview URL
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      // In production, upload to Supabase Storage or similar
      // For now, convert to base64 data URL (small videos only)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onVideoChange?.(dataUrl);
      };
      reader.readAsDataURL(file);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  if (previewUrl) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="relative aspect-video bg-black rounded-t-xl">
          <video
            src={previewUrl}
            controls
            className="w-full h-full object-contain"
            poster=""
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">Video Intro</span>
          </div>
          {editable && (
            <button
              onClick={() => {
                setPreviewUrl("");
                onVideoChange?.("");
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!editable) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h4 className="text-sm font-heading font-bold text-white">Video Intro</h4>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Record a 2-minute intro video. Your AI agent can reference it when talking to recruiters.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 bg-purple-500/15 hover:bg-purple-500/25 border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 font-bold text-sm transition-all flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Video (max 2 min, 50MB)
          </>
        )}
      </button>
    </div>
  );
}
