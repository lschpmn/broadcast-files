import Button from '@material-ui/core/Button';
import React from 'react';
import { DirectoryRoute } from '../../types';

type Props = {
  back: () => void,
  route: DirectoryRoute,
};

const DirectoryList = ({ back, route }: Props) => {
  return <div>
    <div style={{ display: 'flex',  }}>
      <Button onClick={back}>
        <h1>~</h1>
      </Button>

      <h1 style={{ padding: '6px 8px' }}>/</h1>

      <Button>
        <h1>{route.label}</h1>
      </Button>
    </div>
  </div>
};

export default DirectoryList
