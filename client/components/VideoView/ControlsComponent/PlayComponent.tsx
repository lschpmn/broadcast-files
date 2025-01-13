import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { useEffect } from 'react';

type Props = {
  isPlaying: boolean,
  video: HTMLVideoElement,
};

const PlayComponent = ({ isPlaying, video }: Props) => {

  const playPauseFunc = () => {
    if (video?.paused) video.play();
    else if (!video?.paused) video?.pause();
  };

  useEffect(() => {
    const spaceListener =
      (e: KeyboardEvent) => e.key === ' ' && playPauseFunc();

    document.addEventListener('keydown', spaceListener);

    return () => document.removeEventListener('keydown', spaceListener);
  }, [video]);

  return (
    <IconButton onClick={() => playPauseFunc()}>
      {isPlaying ? <Pause/> : <PlayArrow/>}
    </IconButton>
  );
};

export default PlayComponent;
