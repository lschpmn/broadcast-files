import { noop } from 'lodash';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { STREAM_PREFIX } from '../../../constants';
import { FileDetail } from '../../../types';
import { inspectNodeSendServer } from '../../lib/reducers';
import { useAction, useMyPath } from '../../lib/utils';
import { State } from '../../types';
import ControlsComponent from './ControlsComponent';

const VideoView = () => {
  const [pathname, paths] = useMyPath();
  const [isPlaying, setIsPlaying] = useState(false);
  const [offsetTime, setOffsetTime] = useState(0);
  const [video, setVideo] = useState<HTMLVideoElement>(null);
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const videoFile: FileDetail = useSelector((state: State) => state.nodeShrub[pathname], isEqual);
  const duration = videoFile?.videoDetail?.duration || 0;
  const videoPath = STREAM_PREFIX + '/' + paths.join('/');

  useEffect(() => {
    const videoElem = document.querySelector('video');
    setVideo(videoElem);
    videoElem.addEventListener('play', () => setIsPlaying(true));
    videoElem.addEventListener('pause', () => setIsPlaying(false));
  }, []);

  useEffect(() => {
    inspectNodeAction(pathname);
    setOffsetTime(0);
  }, [pathname]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <video
          onClick={() => video?.paused ? video.play().catch(noop) : video?.pause()}
          style={{ height: '100vh', width: '100vw' }}
          src={videoPath + '?t=' + offsetTime}
        />
      </div>
      <ControlsComponent
        duration={duration}
        isPlaying={isPlaying}
        offsetTime={offsetTime}
        setOffsetTime={setOffsetTime}
        video={video}
      />
    </div>
  );
};

export default VideoView;