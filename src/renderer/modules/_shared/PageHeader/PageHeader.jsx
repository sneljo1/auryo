import React from 'react'
import cn from 'classnames'
import PropTypes from "prop-types";

const PageHeader = ({ image, gradient, children, title }) => (
    <div className={cn('page-header ', {
        withImage: image
    })}
    >
        {image && <div className="bgImage"
            style={{ backgroundImage: `url(${image})` }} />}
        {gradient &&
            <div className="gradient" style={{ backgroundImage: gradient }} />}

        <div className="header-content">
            {title ? (<h2>{title}</h2>) : children}
        </div>
    </div>
)

PageHeader.propTypes = {
    image: PropTypes.string,
    gradient: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.any
}

PageHeader.defaultProps = {
    image: null,
    gradient: null,
    title: null,
    children: null
}

export default PageHeader