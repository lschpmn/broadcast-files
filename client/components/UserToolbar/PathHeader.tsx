import HomeIcon from '@mui/icons-material/Home';
import { Breadcrumbs, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { useMyPath } from '../../lib/utils';

const PathHeader = () => {
  const [, paths] = useMyPath();

  return <div style={{ display: 'flex' }}>
    <Link to="/" style={{ display: 'flex' }}>
      <Button style={{ color: 'white' }}>
        <HomeIcon/>
      </Button>
    </Link>

    <Breadcrumbs style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
      {paths.map((path, i) => (
        <Link to={createPathString(paths, i)}>
          <Button style={{ color: 'white' }}>
            {path}
          </Button>
        </Link>
      ))}
    </Breadcrumbs>
  </div>;
};

const createPathString = (paths: string[], i: number): string => {
  return '/' + paths.slice(0, i + 1).map(encodeURIComponent).join('/');
};

export default PathHeader;
