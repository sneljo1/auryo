import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { GenreConfig } from '../../../../shared/constants';

interface Props {
    genre: GenreConfig;
    img?: string;
}

const ChartGenre: React.SFC<Props> = ({ genre, img }) => (
    <Link to={`/charts/${genre.key}`}>
        <div className={cn("chart", { withImage: !!img })}>
            <h1>{genre.name}</h1>
            {
                img && (
                    <img src={img} alt={genre.key} />
                )
            }

            {
                genre.gradient && <div className="overlay"
                    style={{ backgroundImage: genre.gradient }} />
            }

        </div>
    </Link>
)

export default ChartGenre;