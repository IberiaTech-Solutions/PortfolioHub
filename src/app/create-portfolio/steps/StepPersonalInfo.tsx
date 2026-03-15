"use client";

import Image from "next/image";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import PrivacyToggle from "@/components/PrivacyToggle";

interface StepPersonalInfoProps {
  formData: {
    name: string;
    username: string;
    profile_image: string;
    hero_image: string;
    location: string;
    languages: string;
    private_fields: string[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (fn: (prev: any) => any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  profileImagePreview: string;
  heroImagePreview: string;
  handleProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHeroImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  usernameAvailable: boolean | null;
  checkingUsername: boolean;
  checkUsername: (username: string) => void;
  togglePrivateField: (fieldName: string, isPrivate: boolean) => void;
  debounceTimers: React.MutableRefObject<{ [key: string]: NodeJS.Timeout }>;
}

export default function StepPersonalInfo({
  formData,
  setFormData,
  handleChange,
  profileImagePreview,
  heroImagePreview,
  handleProfileImageChange,
  handleHeroImageChange,
  usernameAvailable,
  checkingUsername,
  checkUsername,
  togglePrivateField,
  debounceTimers,
}: StepPersonalInfoProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Full Name */}
      <div className="space-y-3 sm:space-y-4">
        <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-white">
          Your Full Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border rounded-lg sm:rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${
            !formData.name ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="John Doe"
        />
        {!formData.name && <p className="text-red-400 text-xs mt-1">This field is required</p>}
      </div>

      {/* Username */}
      <div className="space-y-1">
        <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-white">
          Username <span className="text-gray-500 font-normal">(vanity URL)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">portfoliohub.com/</span>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setFormData((prev: any) => ({ ...prev, username: val }));
              if (debounceTimers.current["username"]) clearTimeout(debounceTimers.current["username"]);
              debounceTimers.current["username"] = setTimeout(() => checkUsername(val), 500);
            }}
            className="w-full pl-[140px] pr-10 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm sm:text-base"
            placeholder="your-name"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsername && (
              <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            {!checkingUsername && usernameAvailable === true && formData.username.length >= 3 && (
              <CheckIcon className="w-5 h-5 text-emerald-400" />
            )}
            {!checkingUsername && usernameAvailable === false && <XMarkIcon className="w-5 h-5 text-red-400" />}
          </div>
        </div>
        {usernameAvailable === false && <p className="text-red-400 text-xs">This username is taken</p>}
        {usernameAvailable === true && formData.username.length >= 3 && (
          <p className="text-emerald-400 text-xs">Username available!</p>
        )}
      </div>

      {/* Profile Image */}
      <div className="space-y-3 sm:space-y-4">
        <label htmlFor="profile_image" className="block text-xs sm:text-sm font-semibold text-white">
          Profile Image
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-shrink-0">
            {profileImagePreview ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200">
                <Image src={profileImagePreview} alt="Profile preview" width={80} height={80} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg sm:rounded-xl border-2 border-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <input type="file" id="profile_image" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
            <label
              htmlFor="profile_image"
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg sm:rounded-xl text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {profileImagePreview ? "Change Image" : "Upload Image"}
            </label>
            <p className="text-xs text-gray-300 mt-1">Recommended: Square image, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="space-y-3 sm:space-y-4">
        <label htmlFor="hero_image" className="block text-xs sm:text-sm font-semibold text-white">
          Portfolio Hero Image
          <span className="ml-1 sm:ml-2 text-xs text-gray-300 font-normal">(Banner image for portfolio cards)</span>
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-shrink-0">
            {heroImagePreview ? (
              <div className="w-24 h-15 sm:w-32 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200">
                <Image src={heroImagePreview} alt="Hero image preview" width={128} height={80} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-15 sm:w-32 sm:h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg sm:rounded-xl border-2 border-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <input type="file" id="hero_image" accept="image/*" onChange={handleHeroImageChange} className="hidden" />
            <label
              htmlFor="hero_image"
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg sm:rounded-xl text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {heroImagePreview ? "Change Hero Image" : "Upload Hero Image"}
            </label>
            <p className="text-xs text-gray-300 mt-1">Recommended: 16:9 aspect ratio, max 5MB</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="location" className="block text-sm font-medium text-white">Location</label>
          <PrivacyToggle
            fieldName="location"
            isPrivate={formData.private_fields.includes("location")}
            onToggle={togglePrivateField}
          />
        </div>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 text-sm sm:text-base"
          placeholder="San Francisco, CA or Remote"
        />
      </div>

      {/* Languages */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="languages" className="block text-xs sm:text-sm font-medium text-white">Languages</label>
          <PrivacyToggle
            fieldName="languages"
            isPrivate={formData.private_fields.includes("languages")}
            onToggle={togglePrivateField}
          />
        </div>
        <input
          type="text"
          id="languages"
          name="languages"
          value={formData.languages}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 text-sm sm:text-base"
          placeholder="English, Spanish, French"
        />
      </div>
    </div>
  );
}
