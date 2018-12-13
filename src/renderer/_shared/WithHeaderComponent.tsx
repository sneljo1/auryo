import { Location } from 'history';
import { debounce } from 'lodash';
import * as React from 'react';
import CustomScroll from './CustomScroll';

interface Props {
    location: Location;
    previousScrollTop?: number;
    setScrollPosition: (scrollTop: number, pathname: string) => void;
}

interface State {
    scrollTop: number;
}

class WithHeaderComponent<P extends Props, S extends State> extends React.Component<P, S> {

    // tslint:disable-next-line:no-object-literal-type-assertion
    state: S = {
        scrollTop: 0
    } as State as S;

    protected debouncedOnScroll: (scrollTop: number) => void;
    protected scroll: CustomScroll | null = null;

    constructor(props: P) {
        super(props);

        this.debouncedOnScroll = debounce(this.onScroll, 15);
    }

    componentDidMount() {
        const { previousScrollTop } = this.props;

        if (previousScrollTop && this.scroll) {
            requestAnimationFrame(() => {
                this.scroll!.updateScrollPosition(previousScrollTop);
            });
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
