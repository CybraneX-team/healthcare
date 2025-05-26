"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string;
  onComplete?: () => void;
  onProgressUpdate?: (progress: number) => void;
}

export function YouTubePlayer({
  videoId,
  onComplete,
  onProgressUpdate,
}: YouTubePlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube API
  useEffect(() => {
    // Only load the API once
    if (window.YT) {
      initializePlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Re-initialize player when video ID changes
  useEffect(() => {
    if (window.YT && window.YT.Player && playerRef.current) {
      if (player) {
        player.loadVideoById(videoId);
      } else {
        initializePlayer();
      }
    }
  }, [videoId]);

  const initializePlayer = () => {
    if (!playerRef.current) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  };

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());

    // Start progress tracking
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (player && typeof player.getCurrentTime === "function") {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progressPercent = Math.round((currentTime / duration) * 100);

        setCurrentTime(currentTime);
        setProgress(progressPercent);

        if (onProgressUpdate) {
          onProgressUpdate(progressPercent);
        }
      }
    }, 1000);
  };

  const onPlayerStateChange = (event: any) => {
    // Update playing state
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);

    // Check if video ended
    if (event.data === window.YT.PlayerState.ENDED) {
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <div className="w-full h-full">
      <div ref={playerRef} className="w-full h-full"></div>
    </div>
  );
}

// Add YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}
