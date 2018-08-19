import debounce from "lodash/debounce";
import React from 'react';
import PropTypes from "prop-types";

class WithHeaderComponent extends React.Component {

    constructor() {
        super();

        this.debouncedOnScroll = debounce(this.onScroll, 15)
    }

    state = {
        scrollTop: 0
    }

    componentDidMount() {
        const { scrollTop } = this.props;

        if (scrollTop) {
            this.scroll.updateScrollPosition(scrollTop)
        }
    }

    componentWillUnmount() {
        const { setScrollPosition, location } = this.props;
        const { scrollTop } = this.state;

        setScrollPosition(scrollTop, location.pathname)
    }

    onScroll = (scrollTop) => this.setState({ scrollTop })
}

WithHeaderComponent.propTypes = {
    location: PropTypes.object.isRequired,
    scrollTop: PropTypes.number,
    setScrollPosition: PropTypes.func.isRequired,
}

WithHeaderComponent.defaultProps = {
    scrollTop: null,
}

export default WithHeaderComponent