import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { noop } from 'lodash';
import React, { useEffect } from 'react';

type Props = {
  currentTime: number,
  isPlaying: boolean,
  setTime: (time: number) => void,
  video: HTMLVideoElement,
};

const PlayComponent = ({ currentTime, isPlaying, setTime, video }: Props) => {

  const playPauseFunc = () => {
    if (video?.paused) video.play().catch(noop);
    else if (!video?.paused) video?.pause();
  };

  useEffect(() => {
    const spaceListener = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          playPauseFunc();
          break;
        case 'ArrowRight':
          setTime(10);
          break;
        case 'ArrowLeft':
          setTime(-10);
          break;
      }
    }

    document.addEventListener('keydown', spaceListener);

    return () => document.removeEventListener('keydown', spaceListener);
  }, [setTime, video]);

  return (
    <IconButton onClick={() => playPauseFunc()}>
      {isPlaying ? <Pause/> : <PlayArrow/>}
    </IconButton>
  );
};

export default PlayComponent;
