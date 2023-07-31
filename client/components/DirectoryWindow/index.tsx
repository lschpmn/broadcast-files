import { Card, CardActionArea, CardContent } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { getDirectoryListSendServer } from '../../lib/reducers';
import { State } from '../../types';

const NewDirectory = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const list: { name: string, type: 'file' | 'dir' }[] = useSelector(listGrabber, isEqual);

  useEffect(() => {
    dispatch(getDirectoryListSendServer(decodeURIComponent(pathname)));
  }, [pathname]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '0 2rem' }}>
        {list.map(item => (
          <Link key={item.name} to={`${pathname}/${encodeURIComponent(item.name)}`}>
            <Card raised style={{ margin: '1rem', width: '20rem', overflowWrap: 'anywhere' }}>
              <CardActionArea style={{ fontSize: 16 }}>
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

const listGrabber = (state: State) =>
  state.directoryList.list.map(item => ({ name: item.name, type: item.type }));

export default NewDirectory;