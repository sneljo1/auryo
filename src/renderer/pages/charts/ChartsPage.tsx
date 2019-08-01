import { AUDIO_GENRES, MUSIC_GENRES } from "@common/constants";
import cn from "classnames";
import * as React from "react";
import Masonry from "react-masonry-css";
import { NavLink, RouteComponentProps } from "react-router-dom";
import { Nav, TabContent, TabPane } from "reactstrap";
import PageHeader from "../../_shared/PageHeader/PageHeader";
import "./ChartsPage.scss";
import ChartGenre from "./components/ChartGenre";

export const GENRE_IMAGES = {
    "all-music": require("@assets/img/genres/all-music.jpg"),
    alternativerock: require("@assets/img/genres/alternativerock.jpg"),
    ambient: require("@assets/img/genres/ambient.jpg"),
    classical: require("@assets/img/genres/classical.jpg"),
    country: require("@assets/img/genres/country.jpg"),
    danceedm: require("@assets/img/genres/danceedm.jpg"),
    dancehall: require("@assets/img/genres/dancehall.jpg"),
    deephouse: require("@assets/img/genres/deephouse.jpg"),
    disco: require("@assets/img/genres/disco.jpg"),
    drumbass: require("@assets/img/genres/drumbass.jpg"),
    dubstep: require("@assets/img/genres/dubstep.jpg"),
    electronic: require("@assets/img/genres/electronic.jpg"),
    folksingersongwriter: require("@assets/img/genres/folksingersongwriter.jpg"),
    hiphoprap: require("@assets/img/genres/hiphoprap.jpg"),
    house: require("@assets/img/genres/house.jpg"),
    indie: require("@assets/img/genres/indie.jpg"),
    jazzblues: require("@assets/img/genres/jazzblues.jpg"),
    latin: require("@assets/img/genres/latin.jpg"),
    metal: require("@assets/img/genres/metal.jpg"),
    piano: require("@assets/img/genres/piano.jpg"),
    pop: require("@assets/img/genres/pop.jpg"),
    rbsoul: require("@assets/img/genres/rbsoul.jpg"),
    reggae: require("@assets/img/genres/reggae.jpg"),
    reggaeton: require("@assets/img/genres/reggaeton.jpg"),
    rock: require("@assets/img/genres/rock.jpg"),
    soundtrack: require("@assets/img/genres/soundtrack.jpg"),
    techno: require("@assets/img/genres/techno.jpg"),
    trance: require("@assets/img/genres/trance.jpg"),
    trap: require("@assets/img/genres/trap.jpg"),
    triphop: require("@assets/img/genres/triphop.jpg"),
    world: require("@assets/img/genres/world.jpg")
};

interface OwnProps extends RouteComponentProps<{ type?: string }> {
}

enum TabTypes {
    MUSIC = "MUSIC",
    AUDIO = "AUDIO"
}

type AllProps = OwnProps;

class ChartsPage extends React.Component<AllProps> {

    public shouldComponentUpdate(_nextProps: AllProps) {
        return this.props.match.params !== _nextProps.match.params;
    }

    public render() {

        const { match: { params } } = this.props;
        const type = params.type || TabTypes.MUSIC;

        return (
            <>
                <PageHeader title="Charts" />

                <div className="container-fluid charts">
                    <Nav className="tabs" tabs={true}>
                        <NavLink
                            className={cn("nav-link", { active: type === TabTypes.MUSIC })}
                            to={`/charts/${TabTypes.MUSIC}`}
                            activeClassName="active"
                        >
                            Music
                        </NavLink>

                        <NavLink
                            className={cn("nav-link")}
                            activeClassName="active"
                            to={`/charts/${TabTypes.AUDIO}`}
                        >
                            Audio
                        </NavLink>
                    </Nav>

                    <TabContent activeTab={type}>
                        <TabPane tabId={TabTypes.MUSIC}>
                            <div>
                                <Masonry
                                    breakpointCols={{
                                        default: 5,
                                        1400: 4,
                                        1100: 3,
                                        700: 2,
                                        500: 1
                                    }}
                                    className="my-masonry-grid"
                                >
                                    {MUSIC_GENRES.map((genre) => (
                                        <ChartGenre
                                            key={`chart-genre-key-${genre.key}`}
                                            genre={genre}
                                            img={GENRE_IMAGES[genre.key]}
                                        />
                                    ))}
                                </Masonry>

                            </div>
                        </TabPane>
                        <TabPane tabId={TabTypes.AUDIO}>
                            <div className="row">
                                {AUDIO_GENRES.map((genre) => (
                                    <div key={genre.key} className="col-4 col-lg-3">
                                        <ChartGenre genre={genre} />
                                    </div>
                                ))}
                            </div>
                        </TabPane>
                    </TabContent>
                </div>
            </>
        );
    }
}

export default ChartsPage;
