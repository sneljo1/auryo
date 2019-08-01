import { setScrollPosition } from "@common/store/ui";
import { Location } from "history";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "reactstrap";
import CustomScroll from "../../_shared/CustomScroll";
import Spinner from "../../_shared/Spinner/Spinner";
import Header from "../../app/components/Header/Header";

interface OwnProps {
    children: React.ReactNode;
    query: string;
    previousScrollTop?: number;
    setScrollPosition: typeof setScrollPosition;
    location: Location;
    loadMore(): void;
    hasMore(): boolean;
}

interface State {
    scrollTop: number;
}

class SearchWrapper extends React.Component<OwnProps, State> {

    public render() {
        const { query, loadMore } = this.props;

        return (
            <CustomScroll
                heightRelativeToParent="100%"
                loader={<Spinner />}
                ref={(r) => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                loadMore={loadMore}
            >
                <div id="search-page" className="h-100">
                    <Header
                        focus={true}
                        query={query}
                        scrollTop={this.state.scrollTop}
                    />

                    <div className="search-content p-2">
                        <Nav className="tabs px-4" tabs={true}>
                            <NavLink
                                exact={true}
                                className="nav-link"
                                to={{ pathname: `/search`, search: query }}
                                activeClassName="active"
                            >
                                All
                            </NavLink>

                            <NavLink
                                className="nav-link"
                                to={{ pathname: `/search/user`, search: query }}
                                activeClassName="active"
                            >
                                Users
                            </NavLink>
                            <NavLink
                                className="nav-link"
                                to={{ pathname: `/search/track`, search: query }}
                                activeClassName="active"
                            >
                                Tracks
                            </NavLink>
                            <NavLink
                                className="nav-link"
                                to={{ pathname: `/search/playlist`, search: query }}
                                activeClassName="active"
                            >
                                Playlist
                            </NavLink>
                        </Nav>
                        {this.props.children}
                    </div>
                </div>
            </CustomScroll>
        );
    }
}

export default SearchWrapper;
