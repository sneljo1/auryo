import { GenreConfig } from '@common/constants';
import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  genre: GenreConfig;
  img?: string;
}

export const ChartGenre = React.memo<Props>(({ genre, img }) => (
  <Link to={`/charts/genre/${genre.key}`}>
    <div className={cn('chart', { withImage: !!img })}>
      <h1>{genre.name}</h1>
      {img && <img src={img} alt="chart" />}

      {genre.gradient && <div className="overlay" style={{ backgroundImage: genre.gradient }} />}
    </div>
  </Link>
));
