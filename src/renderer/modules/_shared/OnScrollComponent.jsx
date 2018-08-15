import React from 'react'
import PropTypes from 'prop-types'
import InfiniteScroll from './InfiniteScroll'

const OnScrollComponent = ({ onScroll, hasMore, children }) => (
    <InfiniteScroll
        pageStart={0}
        useWindow={false}
        loadMore={onScroll}
        hasMore={hasMore}

        loader={<div>Loading ...</div>}>
        <div key="children">
            {children}
        </div>
    </InfiniteScroll>
)


OnScrollComponent.propTypes = {
    onScroll: PropTypes.func,
    hasMore: PropTypes.bool,
    children: PropTypes.any.isRequired
}

OnScrollComponent.defaultProps = {
    hasMore: true
}

export default OnScrollComponent
