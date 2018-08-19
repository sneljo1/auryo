import cn from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";

const ChartGenre = ({ genre, img }) => (
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

ChartGenre.propTypes = {
    genre: PropTypes.object.isRequired,
    img: PropTypes.string
}

ChartGenre.defaultProps = {
    img: null
}


export default ChartGenre;