"use client";

import { useEffect, useState } from "react";

interface VideoPlayerProps {
  videoId: string;
  onComplete?: () => void;
}

export function VideoPlayer({ videoId, onComplete }: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = loadVideo;
    } else {
      loadVideo();
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  function loadVideo() {
    if (player) {
      player.destroy();
    }

    const newPlayer = new window.YT.Player("youtube-player", {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  }

  function onPlayerReady(event: any) {
    setIsLoaded(true);
  }

  function onPlayerStateChange(event: any) {
    // Update playing state
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);

    // Track progress
    if (event.data === window.YT.PlayerState.PLAYING) {
      const progressInterval = setInterval(() => {
        if (player) {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const calculatedProgress = (currentTime / duration) * 100;
          setProgress(calculatedProgress);

          // Consider video complete at 90%
          if (calculatedProgress > 90 && onComplete) {
            onComplete();
            clearInterval(progressInterval);
          }
        }
      }, 1000);

      return () => clearInterval(progressInterval);
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div id="youtube-player" className="w-full h-full"></div>

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

// Add type definition for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
