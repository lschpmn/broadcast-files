import { Pause, PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React from 'react';

type Props = {
  isPlaying: boolean,
  video: HTMLVideoElement,
};

const PlayComponent = ({ isPlaying, video }: Props) => {

  const playPauseFunc = () => {
    if (!isPlaying && video.paused) video.play();
    else if (isPlaying && !video.paused) video.pause();
  };

  return (
    <IconButton onClick={() => playPauseFunc()}>
      {isPlaying ? <Pause/> : <PlayArrow/>}
    </IconButton>
  );
};

export default PlayComponent;
