import { Card, CardActionArea, CardContent } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { getDirectoryListSendServer } from '../../lib/reducers';
import { State } from '../../types';
import PathHeader from './PathHeader';

const NewDirectory = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const list = useSelector((state: State) => state.directoryList.list);

  useEffect(() => {
    dispatch(getDirectoryListSendServer(decodeURIComponent(pathname)));
  }, [pathname]);

  return (
    <div>
      <PathHeader/>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '0 2rem' }}>
        {list.map(item => (
          <Link to={`${pathname}/${encodeURIComponent(item.name)}`}>
            <Card raised style={{ margin: '1rem', width: '20rem', overflowWrap: 'anywhere' }}>
              <CardActionArea style={{ fontSize: 16 }} >
                <CardContent>
                  {item.name}<br/><br/>
                  Type: {item.type}
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewDirectory;