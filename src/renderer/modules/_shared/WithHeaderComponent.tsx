import { Location } from 'history';
import debounce from 'lodash/debounce';
import React from 'react';
import CustomScroll from './CustomScroll';

interface Props {
    location: Location;
    previousScrollTop?: number;
    setScrollPosition: Function;
}

interface State {
    scrollTop: number;
}

class WithHeaderComponent<P extends Props, S extends State> extends React.Component<P, S> {

    state: S = {
        scrollTop: 0
    } as State as S;

    protected debouncedOnScroll: Function;
    protected scroll: CustomScroll | null;

    constructor(props: P) {
        super(props);

        this.debouncedOnScroll = debounce(this.onScroll, 15);
    }

    componentDidMount() {
        const { previousScrollTop } = this.props;

        if (previousScrollTop && this.scroll) {
            this.scroll.updateScrollPosition(previousScrollTop);
        }
    }

    componentWillUnmount() {
        const { setScrollPosition, location } = this.props;
        const { scrollTop } = this.state;

        if (setScrollPosition) {
            setScrollPosition(scrollTop, location.pathname);
        }
    }

    protected onScroll = (scrollTop: number) => this.setState({ scrollTop });
}

export default WithHeaderComponent;
