import Button from '@material-ui/core/Button';
import { InspectResult } from 'fs-jetpack/types';
import React, { useEffect, useState } from 'react';
import { DirectoryRoute } from '../../types';
import { CustomWindowProperties } from '../types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;

type Props = {
  back: () => void,
  route: DirectoryRoute,
};

const DirectoryList = ({ back, route }: Props) => {
  const [currentLocation, setCurrentLocation] = useState([route.urlPath]);
  const [list, setList] = useState([] as InspectResult[]);

  useEffect(() => {
    fetch(`${domain}${currentLocation.join('/')}`)
      .then(async res => setList(await res.json()))
      .catch(console.log);
  }, [currentLocation]);

  return <div>
    <div style={{ display: 'flex' }}>
      <Button onClick={back}>
        <h1>~</h1>
      </Button>

      <h1 style={{ padding: '6px 8px' }}>/</h1>
      <Button onClick={() => setCurrentLocation([route.urlPath])}>
        <h1>{route.label}</h1>
      </Button>

      {currentLocation.slice(1).map((loc, i) =>
        <React.Fragment key={i}>
          <h1 style={{ padding: '6px 8px' }}>/</h1>
          <Button onClick={() => currentLocation.length !== i + 2 && setCurrentLocation(currentLocation.slice(0, i + 2))}>
            <h1>{loc}</h1>
          </Button>
        </React.Fragment>
      )}
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {list.map(item =>
        <Button
          key={item.name}
          href={item.type === 'file'
            ? domain + currentLocation.join('/') + '/' + encodeURIComponent(item.name)
            : ''}
          onClick={() => item.type === 'dir'
            && setCurrentLocation([...currentLocation, item.name])}
          style={{ wordBreak: 'break-word', height: '7.5rem', width: '20rem' }}
        >
          {item.name}
        </Button>
      )}
    </div>
  </div>;
};

export default DirectoryList;
