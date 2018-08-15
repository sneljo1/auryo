import React from 'react'
import { Nav } from 'reactstrap'
import { Route, Switch, withRouter } from 'react-router'
import './search.scss'
import SearchPage from './SearchPage'
import SearchCategoryPage from './Category/SearchCategoryPage'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import CustomScroll from '../_shared/CustomScroll'
import { setScrollPosition } from '../../../shared/actions'
import Spinner from '../_shared/Spinner/Spinner'
import WithHeaderComponent from '../_shared/WithHeaderComponent'
import Header from '../app/components/Header/Header'

class SearchWrapper extends WithHeaderComponent {

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
        const { params: { query } } = match

        return (
            <CustomScroll heightRelativeToParent="100%"
                loader={<Spinner />}
                onScroll={this.debouncedOnScroll}
                loadMore={this.loadMore}
                hasMore={this.hasMore()}
            >

                <div id="search-page" className="h-100">
                    <Header focus query={query}
                        scrollTop={this.state.scrollTop}>

                        <Nav className="search-tabs">
                            <NavLink exact className="nav-link" to={'/search/' + query}
                                activeClassName="active">All</NavLink>
                            <NavLink className="nav-link" to={'/search/' + query + '/user'}
                                activeClassName="active">Users</NavLink>
                            <NavLink className="nav-link" to={'/search/' + query + '/track'}
                                activeClassName="active">Tracks</NavLink>
                            <NavLink className="nav-link" to={'/search/' + query + '/playlist'}
                                activeClassName="active">Playlist</NavLink>
                        </Nav>
                    </Header>


                    <div className="search-content p-2">
                        <Switch>
                            <Route exact path={`${match.url}`} render={(props) => (
                                <SearchPage query={query} ref={ref => this.child = ref} {...props} />
                            )} />
                            <Route path={`${match.url}/:category`} render={(props) => (
                                <SearchCategoryPage query={query} ref={ref => this.child = ref}{...props} />
                            )} />
                        </Switch>
                    </div>
                </div>
            </CustomScroll>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { ui } = state
    const { location } = props
    return {
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default withRouter(connect(mapStateToProps, {
    push: push,
    replace: replace,
    setScrollPosition: setScrollPosition
})(SearchWrapper))