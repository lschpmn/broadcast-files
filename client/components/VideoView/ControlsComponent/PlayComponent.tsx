import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { noop } from 'lodash';
import React, { RefObject, useEffect, useRef } from 'react';

type Props = {
  isPlaying: boolean,
  setTime: (time: number) => void,
  video: HTMLVideoElement,
};

const PlayComponent = ({ isPlaying, setTime, video }: Props) => {
  const onButtonRef: RefObject<(e: KeyboardEvent) => void> = useRef(null);

  const playPauseFunc = () => {
    if (video?.paused) video.play().catch(noop);
    else if (!video?.paused) video?.pause();
  };

  useEffect(() => {
    onButtonRef.current = (e: KeyboardEvent) => {
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
  }, [setTime, video]);

  useEffect(() => {
    const buttonListener = (e: KeyboardEvent) => {
      onButtonRef.current?.(e)
    };

    document.addEventListener('keydown', buttonListener);

    return () => document.removeEventListener('keydown', buttonListener);
  });

  return (
    <IconButton onClick={() => playPauseFunc()}>
      {isPlaying ? <Pause/> : <PlayArrow/>}
    </IconButton>
  );
};

export default PlayComponent;
