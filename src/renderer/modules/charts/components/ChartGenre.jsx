import React from "react";
import { Link } from "react-router-dom"
import LazyLoad from 'react-lazyload';
import PropTypes from "prop-types";
import cn from "classnames";

const ChartGenre = ({ genre, img }) => (
    <Link to={`/charts/${genre.key}`}>
        <div className={cn("chart", { withImage: !!img })}>
            <h1>{genre.name}</h1>
            {
                img && (
                    <LazyLoad><img src={img} alt={genre.key} /></LazyLoad>
                )
            }

            {
                genre.gradient && <div className="overlay"
                    style={{ backgroundImage: genre.gradient }} />
            }

        </div>
    </Link>
)

ChartGenre.propTypes = {
    genre: PropTypes.object.isRequired,
    img: PropTypes.string
}


export default ChartGenre;