import React, { useEffect } from 'react';
import { STREAM_PREFIX } from '../../constants';
import { useMyPath } from '../lib/utils';

const VideoView = () => {
  const [pathname, paths] = useMyPath();

  const videoPath = STREAM_PREFIX + '/' + paths.join('/');

  useEffect(() => {
    const videoElem = document.querySelector('video');
    videoElem.addEventListener('play', () => console.log('video playing'));
    videoElem.addEventListener('pause', () => console.log('video paused'));
    console.log(videoElem);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <video controls style={{ height: '100vh', width: '100vw' }} src={videoPath}/>
      </div>
    </div>
  );
};

export default VideoView;