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
        const { match } = this.props
        const { params: { query } } = match;

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
                    <Header focus query={query}
                        scrollTop={this.state.scrollTop}>

                        <Nav className="search-tabs">
                            <NavLink exact className="nav-link" to={`/search/${query}`}
                                activeClassName="active">All</NavLink>
                            <NavLink className="nav-link" to={`/search/${query}/user`}
                                activeClassName="active">Users</NavLink>
                            <NavLink className="nav-link" to={`/search/${query}/track`}
                                activeClassName="active">Tracks</NavLink>
                            <NavLink className="nav-link" to={`/search/${query}/playlist`}
                                activeClassName="active">Playlist</NavLink>
                        </Nav>
                    </Header>


                    <div className="search-content p-2">
                        <Switch>
                            <Route exact path={`${match.url}`} render={(props) => (
                                <SearchPage
                                    query={query}
                                    ref={ref => this.child = ref}
                                    {...props} />
                            )} />
                            <Route path={`${match.url}/:category`}
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