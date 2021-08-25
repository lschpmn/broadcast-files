import Button from '@material-ui/core/Button';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type Props = {
  setList: (list: []) => void,
};

const PathHeader = ({ setList }: Props) => {
  const { pathname } = useLocation();
  const routes = pathname.split('/').slice(1);

  return <div style={{ display: 'flex' }}>
    <Link to="/">
      <Button>
        <h2>~</h2>
      </Button>
    </Link>

    {routes.map((route, i) =>
      <React.Fragment key={i}>
        <h2 style={{ padding: '6px 8px' }}>/</h2>
        <Link to={'/' + routes.slice(0, i + 1).join('/')}>
          <Button>
            <h2>{decodeURIComponent(route)}</h2>
          </Button>
        </Link>
      </React.Fragment>,
    )}
  </div>;
};

export default PathHeader;
