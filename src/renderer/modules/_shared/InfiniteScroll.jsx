import React from 'react'
import InfiniteScroll from 'react-infinite-scroller'

class CustomInfiniteScroll extends InfiniteScroll {

    /**
     * We are overriding the getParentElement function to use a custom element as the scrollable element
     *
     * @param {any} el the scroller domNode
     * @returns {any} the parentNode to base the scroll calulations on
     *
     * @memberOf CustomInfiniteScroll
     */
    getParentElement(el) {
        if (this.props.scrollParent) {
            return this.props.scrollParent
        }
        return super.getParentElement(el)
    }

    render() {
        return super.render()
    }
}

export default CustomInfiniteScroll

