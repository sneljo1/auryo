import { AUDIO_GENRES, MUSIC_GENRES } from '@common/constants';
import cn from 'classnames';
import React, { FC } from 'react';
import Masonry from 'react-masonry-css';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { Nav, TabContent, TabPane } from 'reactstrap';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import './ChartsPage.scss';
import { ChartGenre } from './components/ChartGenre';
import { GENRE_IMAGES } from './genreImages';

type Props = RouteComponentProps<{ type?: string }>;

enum TabTypes {
  MUSIC = 'MUSIC',
  AUDIO = 'AUDIO'
}

export const ChartsPage: FC<Props> = ({ match: { params } }) => {
  const type = params.type || TabTypes.MUSIC;

  return (
    <>
      <PageHeader title="Charts">
        <Nav className="tabs" tabs>
          <NavLink
            className={cn('nav-link', { active: type === TabTypes.MUSIC })}
            to={`/charts/${TabTypes.MUSIC}`}
            activeClassName="active">
            Music
          </NavLink>

          <NavLink className={cn('nav-link')} activeClassName="active" to={`/charts/${TabTypes.AUDIO}`}>
            Audio
          </NavLink>
        </Nav>
      </PageHeader>

      <div className="container-fluid charts">
        <TabContent activeTab={type}>
          <TabPane tabId={TabTypes.MUSIC}>
            <div>
              <Masonry
                breakpointCols={{
                  default: 5,
                  1400: 4,
                  1100: 3,
                  700: 2,
                  500: 1
                }}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">
                {MUSIC_GENRES.map((genre) => (
                  <ChartGenre key={`chart-genre-key-${genre.key}`} genre={genre} img={GENRE_IMAGES[genre.key]} />
                ))}
              </Masonry>
            </div>
          </TabPane>
          <TabPane tabId={TabTypes.AUDIO}>
            <div className="row">
              {AUDIO_GENRES.map((genre) => (
                <div key={genre.key} className="col-4 col-lg-3">
                  <ChartGenre genre={genre} />
                </div>
              ))}
            </div>
          </TabPane>
        </TabContent>
      </div>
    </>
  );
};
