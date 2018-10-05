import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { push, replace } from 'react-router-redux';
import { Nav } from 'reactstrap';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import Spinner from '../_shared/Spinner/Spinner';
import WithHeaderComponent from '../_shared/WithHeaderComponent';
import SearchCategoryPage from './Category/SearchCategoryPage';
import SearchPage from './SearchPage';
import { setScrollPosition } from '../../../shared/store/ui';
import { StoreState } from '../../../shared/store';

interface OwnProps extends RouteComponentProps<{ query: string }> {
}

interface PropsFromState {
    previousScrollTop?: number;
}

interface PropsFromDispatch {
    setScrollPosition: typeof setScrollPosition;
}

interface State {
    scrollTop: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class SearchWrapper extends WithHeaderComponent<AllProps, State> {

    private child: any;

    componentDidMount() {
        super.componentDidMount()
    }

    loadMore = () => {
        if (this.child) {
            const child = this.child.getWrappedInstance()
            if (child && child.loadMore) {
                child.loadMore()
            }
        }
    }

    hasMore = () => {
        if (this.child) {
            const child = this.child.getWrappedInstance()
            if (child && child.hasMore) {
                return child.hasMore()
            }
        }

        return false
    }

    render() {
        const { location } = this.props
        const { search: rawSearch } = location;

        const search = decodeURI(rawSearch.replace("?", ""))

        return (
            <CustomScroll
                heightRelativeToParent="100%"
                loader={<Spinner />}
                ref={r => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                loadMore={this.loadMore}
                hasMore={this.hasMore()}
            >
                <div id="search-page" className="h-100">
                    <Header focus query={search}
                        scrollTop={this.state.scrollTop}>

                        <Nav className="search-tabs">
                            <NavLink exact className="nav-link"
                                to={{ pathname: `/search`, search }}
                                activeClassName="active">All</NavLink>
                            <NavLink className="nav-link"
                                to={{ pathname: `/search/user`, search }}
                                activeClassName="active">Users</NavLink>
                            <NavLink className="nav-link"
                                to={{ pathname: `/search/track`, search }}
                                activeClassName="active">Tracks</NavLink>
                            <NavLink className="nav-link"
                                to={{ pathname: `/search/playlist`, search }}
                                activeClassName="active">Playlist</NavLink>
                        </Nav>
                    </Header>


                    <div className="search-content p-2">
                        <Switch>
                            <Route exact path="/search" render={(props) => (
                                <SearchPage
                                    query={search}
                                    ref={ref => this.child = ref}
                                    {...props} />
                            )} />
                            <Route path={`/search/:category`}
                                render={(props) => (
                                    <SearchCategoryPage
                                        ref={ref => this.child = ref}
                                        {...props} />
                                )} />
                        </Switch>
                    </div>
                </div>
            </CustomScroll>
        )
    }
}

const mapStateToProps = ({ ui }: StoreState, { location, history }: OwnProps): PropsFromState => ({
    previousScrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
})

export default withRouter(connect<PropsFromState>(mapStateToProps, {
    push,
    replace,
    setScrollPosition
})(SearchWrapper))