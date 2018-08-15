import React from 'react'
import debounce from "lodash/debounce";

class WithHeaderComponent extends React.Component {

    state = {
        scrollTop: 0
    }

    constructor(){
        super();

        this.debouncedOnScroll = debounce(this.onScroll, 15)
    }

    onScroll = (scrollTop) => this.setState({ scrollTop })
}

export default WithHeaderComponent