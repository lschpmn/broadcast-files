import Button from '@material-ui/core/Button';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { get } from '../../lib/utils';

type Props = {
  setList: (list: []) => void,
};

const PathHeader = ({ setList }: Props) => {
  const { pathname } = useLocation();
  const routes = pathname.split('/').slice(1);

  useEffect(() => {
    get(`/dir${pathname}`)
      .then(setList)
      .catch(console.log);
  }, [pathname]);

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
