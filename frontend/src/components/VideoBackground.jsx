import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';

/**
 * Reusable Video & Photo Background Component (NPCI Style)
 * 
 * Features:
 * - Autoplay, Loop, Muted, PlaysInline
 * - Light/subtle dark overlay for vibrant photo/video visibility
 * - Supports both video (/assets/videos/hero-video.mp4) and poster photo (/assets/images/safety-photo-1.jpg)
 */
export default function VideoBackground({
  videoSrc = '/assets/videos/hero-video.mp4',
  posterSrc = '/assets/images/safety-photo-1.jpg',
  overlayOpacity = 'bg-black/40', // Light opacity overlay so media is clearly visible
  children,
  className = '',
  showControls = false,
  badgeText = 'LIVE HSSE SURVEILLANCE'
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoSrc]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={`relative overflow-hidden w-full ${className}`}>
      {/* Background Video & Photo Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        
        {/* Background Poster Photo Fallback */}
        <img
          src={posterSrc}
          alt="Safety Background Media"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Live Background Video (Playing over photo) */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />

        {/* Light Transparent Overlay for optimal contrast & high media visibility */}
        <div className={`absolute inset-0 ${overlayOpacity} backdrop-blur-[0.5px] transition-all`} />
        
        {/* Subtle Top & Bottom Gradient for seamless navbar/content blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Optional Interactive Controls Badge */}
      {showControls && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs text-white shadow-xl">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className="font-mono font-medium text-slate-200">{badgeText}</span>
          <span className="text-white/40">|</span>
          <button 
            onClick={togglePlay}
            className="hover:text-orange-400 p-1 transition-colors"
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button 
            onClick={toggleMute}
            className="hover:text-orange-400 p-1 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}