import React from 'react'
import debounce from "lodash/debounce";
import { connect } from 'redux';
import { withRouter } from 'react-router-dom';

class WithHeaderComponent extends React.Component {

    state = {
        scrollTop: 0
    }

    constructor(){
        super();

        this.debouncedOnScroll = debounce(this.onScroll, 15)
    }

    componentDidMount() {
        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }
    }

    componentWillUnmount(){
        this.props.setScrollPosition(this.state.scrollTop, this.props.location.pathname)
    }

    onScroll = (scrollTop) => this.setState({ scrollTop })
}

const mapStateToProps = (state, props) => {
    const { ui } = state
    const { location } = props

    return {
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default WithHeaderComponent