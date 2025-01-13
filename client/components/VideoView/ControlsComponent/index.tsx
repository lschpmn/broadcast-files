import { AppBar, Toolbar, Typography } from '@mui/material';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { getTimeStr } from '../../../lib/utils';
import AutoplayComponent from './AutoplayComponent';
import PlayComponent from './PlayComponent';
import SliderComponent from './SliderComponent';

const OPACITY = 0.95;
const FRAMES = 33;
const TIMEOUT = 2000;
const RATE = OPACITY / FRAMES / TIMEOUT * 1000;

type Props = {
  currentTime: number,
  duration: number,
  isPlaying: boolean,
  setTime: (time: number) => void,
  video: HTMLVideoElement,
};

const ControlsComponent = ({ currentTime, duration, isPlaying, setTime, video }: Props) => {
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [opacity, setOpacity] = useState(OPACITY);

  useEffect(() => {
    if (isPlaying && !isMouseMoving) {
      const intervalId = setInterval(() => {
        setOpacity(p => {
          if (p < 0) {
            clearInterval(intervalId);
            video && (video.style.cursor = 'none');
          }
          return p - RATE;
        });
      }, FRAMES);

      return () => clearInterval(intervalId);
    } else {
      setOpacity(OPACITY);
      video && (video.style.cursor = 'auto');
    }
  }, [isPlaying, isMouseMoving]);

  useEffect(() => {
    const start = debounce(() => setIsMouseMoving(true), TIMEOUT, { leading: true, trailing: false });
    const end = debounce(() => setIsMouseMoving(false), TIMEOUT, { leading: false, trailing: true });

    const lisenter = () => { start(); end(); }

    document.addEventListener('mousemove', lisenter);
    return () => document.removeEventListener('mousemove', lisenter);
  }, []);

  return (
    <AppBar position="absolute" style={{ bottom: 0, opacity: opacity, top: 'auto', zIndex: opacity > 0 ? 100 : -100 }}>
      <Toolbar style={{ display: 'flex', flexDirection: 'column' }}>
        <SliderComponent currentTime={currentTime} duration={duration} setTime={setTime}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <PlayComponent isPlaying={isPlaying} video={video}/>
          <Typography style={{ margin: '0 1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ margin: '0 0.5rem' }}>{getTimeStr(currentTime)}</span>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ margin: '0 0.5rem' }}>{getTimeStr(duration)}</span>
          </Typography>

          <div style={{ flex: 1 }}/>
          <AutoplayComponent ended={video?.ended} isPlaying={isPlaying}/>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default ControlsComponent;