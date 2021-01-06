import { setDebouncedSearchQuery } from '@common/store/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import './SearchBox.scss';

export const SearchBox: FC = () => {
  const [query, setQuery] = useState<string>('');
  const searchInput = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const focus = useCallback(() => {
    if (searchInput?.current) searchInput.current?.focus();
  }, []);

  const updateQuery = useCallback(
    (query: string) => {
      setQuery(query);
      dispatch(setDebouncedSearchQuery(query));
    },
    [dispatch]
  );

  useEffect(() => {
    ipcRenderer.on('keydown:search', focus);
    return () => {
      ipcRenderer.removeListener('keydown:search', focus);
    };
  }, [focus]);

  return (
    <div className="input-group search-box d-flex justify-content-center align-items-center globalSearch">
      <div className="input-group-prepend">
        <span className="input-group-text">
          <i className="bx bx-search" />
        </span>
      </div>
      <input
        ref={searchInput}
        type="text"
        className="form-control"
        placeholder="Search people, tracks and albums"
        value={query}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            dispatch(setDebouncedSearchQuery(query));
          }
        }}
        onKeyUp={e => e.preventDefault()}
        onChange={event => updateQuery(event.target.value)}
      />

      <div className="input-group-append">
        <span className="input-group-text">
          <a id="clear" href="javascript:void(0)" onClick={() => updateQuery('')}>
            <i id="clear" className="input-group-addon bx bx-x" />
          </a>
        </span>
      </div>
    </div>
  );
};
