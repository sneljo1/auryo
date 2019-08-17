import { Location } from "history";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "reactstrap";

interface OwnProps {
    children: React.ReactNode;
    query: string;
    location: Location;
}

interface State {
}

class SearchWrapper extends React.Component<OwnProps, State> {

    public render() {
        const { query } = this.props;

        return (
            <>
                <div id="search-page" className="h-100">

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
            </>
        );
    }
}

export default SearchWrapper;
