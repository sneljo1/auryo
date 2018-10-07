import { Location } from 'history';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'reactstrap';
import { setScrollPosition } from '../../../common/store/ui';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import Spinner from '../_shared/Spinner/Spinner';
import WithHeaderComponent from '../_shared/WithHeaderComponent';

interface OwnProps {
    children: React.ReactNode;
    query: string;
    loadMore: () => void;
    hasMore: () => boolean;
    previousScrollTop?: number;
    setScrollPosition: typeof setScrollPosition;
    location: Location;
}

interface State {
    scrollTop: number;
}

class SearchWrapper extends WithHeaderComponent<OwnProps, State> {

    componentDidMount() {
        super.componentDidMount();
    }

    render() {
        const { query, loadMore } = this.props;

        return (
            <CustomScroll
                heightRelativeToParent='100%'
                loader={<Spinner />}
                ref={(r) => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                loadMore={loadMore}
            >
                <div id='search-page' className='h-100'>
                    <Header
                        focus={true}
                        query={query}
                        scrollTop={this.state.scrollTop}
                    >

                        <Nav className='search-tabs'>
                            <NavLink
                                exact={true}
                                className='nav-link'
                                to={{ pathname: `/search`, search: query }}
                                activeClassName='active'
                            >
                                All
                            </NavLink>

                            <NavLink
                                className='nav-link'
                                to={{ pathname: `/search/user`, search: query }}
                                activeClassName='active'
                            >
                                Users
                            </NavLink>
                            <NavLink
                                className='nav-link'
                                to={{ pathname: `/search/track`, search: query }}
                                activeClassName='active'
                            >
                                Tracks
                            </NavLink>
                            <NavLink
                                className='nav-link'
                                to={{ pathname: `/search/playlist`, search: query }}
                                activeClassName='active'
                            >
                                Playlist
                            </NavLink>
                        </Nav>
                    </Header>


                    <div className='search-content p-2'>
                        {this.props.children}
                    </div>
                </div>
            </CustomScroll>
        );
    }
}

export default SearchWrapper;
