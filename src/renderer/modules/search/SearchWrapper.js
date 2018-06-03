import React from 'react'
import { Nav } from 'reactstrap'
import { Route, Switch, withRouter } from 'react-router'
import './search.scss'
import img_url from '../../../assets/img/search.jpg'
import SearchPage from './SearchPage'
import SearchCategoryPage from './Category/SearchCategoryPage'
import { NavLink } from 'react-router-dom'
import SearchBox from '../app/components/Header/Search/searchBox.component'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import CustomScroll from '../_shared/CustomScroll'
import debounce from 'lodash/debounce'
import { setScrollPosition } from '../../../shared/actions'
import Spinner from '../_shared/Spinner/spinner.component'

class SearchWrapper extends React.Component {

    componentDidMount() {

        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }

        this.debouncedSetScroll = debounce(this.props.setScrollPosition, 10)
    }

    componentWillReceiveProps(nextProps) {
        const { match } = this.props
        const { params: { query } } = match

        if (query !== nextProps.match.params.query) {
            this.searchBox.setValue(nextProps.match.params.query || '')
        }
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
        const { match, replace, push } = this.props
        const { params: { query } } = match

        return (
            <CustomScroll heightRelativeToParent="100%"
                          loader={<Spinner />}
                          loadMore={this.loadMore}
                          hasMore={this.hasMore()}
                          onScroll={this.debouncedSetScroll}>
                <div id="search-page" className="h-100">
                    <div id='playlist-header' className="hasImage">
                        <div className="imgOverlay" style={{ backgroundImage: 'url(' + img_url + ')' }} />

                        <div id='playlist-info'>
                            <SearchBox ref={r => this.searchBox = r} className="" value={query}
                                       handleSearch={(prev, query) => {
                                           replace(`/search/${query}`)
                                       }} />
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
                        </div>
                    </div>


                    <div className="search-content h-100 p-2">
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