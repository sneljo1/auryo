/* eslint-disable global-require */

import cn from 'classnames';
import React from 'react';
import Masonry from 'react-masonry-css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Nav, NavLink, TabContent, TabPane } from 'reactstrap';
import * as actions from '../../../shared/actions';
import { AUDIO_GENRES, MUSIC_GENRES } from '../../../shared/constants';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import PageHeader from '../_shared/PageHeader/PageHeader';
import WithHeaderComponent from '../_shared/WithHeaderComponent';
import './ChartsPage.scss';
import ChartGenre from './components/ChartGenre';

export const GENRE_IMAGES = {
    'all-music': require('../../../assets/img/genres/all-music.jpg'),
    'alternativerock': require('../../../assets/img/genres/alternativerock.jpg'),
    'ambient': require('../../../assets/img/genres/ambient.jpg'),
    'classical': require('../../../assets/img/genres/classical.jpg'),
    'country': require('../../../assets/img/genres/country.jpg'),
    'danceedm': require('../../../assets/img/genres/danceedm.jpg'),
    'dancehall': require('../../../assets/img/genres/dancehall.jpg'),
    'deephouse': require('../../../assets/img/genres/deephouse.jpg'),
    'disco': require('../../../assets/img/genres/disco.jpg'),
    'drumbass': require('../../../assets/img/genres/drumbass.jpg'),
    'dubstep': require('../../../assets/img/genres/dubstep.jpg'),
    'electronic': require('../../../assets/img/genres/electronic.jpg'),
    'folksingersongwriter': require('../../../assets/img/genres/folksingersongwriter.jpg'),
    'hiphoprap': require('../../../assets/img/genres/hiphoprap.jpg'),
    'house': require('../../../assets/img/genres/house.jpg'),
    'indie': require('../../../assets/img/genres/indie.jpg'),
    'jazzblues': require('../../../assets/img/genres/jazzblues.jpg'),
    'latin': require('../../../assets/img/genres/latin.jpg'),
    'metal': require('../../../assets/img/genres/metal.jpg'),
    'piano': require('../../../assets/img/genres/piano.jpg'),
    'pop': require('../../../assets/img/genres/pop.jpg'),
    'rbsoul': require('../../../assets/img/genres/rbsoul.jpg'),
    'reggae': require('../../../assets/img/genres/reggae.jpg'),
    'reggaeton': require('../../../assets/img/genres/reggaeton.jpg'),
    'rock': require('../../../assets/img/genres/rock.jpg'),
    'soundtrack': require('../../../assets/img/genres/soundtrack.jpg'),
    'techno': require('../../../assets/img/genres/techno.jpg'),
    'trance': require('../../../assets/img/genres/trance.jpg'),
    'trap': require('../../../assets/img/genres/trap.jpg'),
    'triphop': require('../../../assets/img/genres/triphop.jpg'),
    'world': require('../../../assets/img/genres/world.jpg')
}

class ChartsPage extends WithHeaderComponent {

    state = {
        activeTab: '1'
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.activeTab !== nextState.activeTab ||
            (this.state.scrollTop < 52 && nextState.scrollTop > 52) || (this.state.scrollTop > 52 && nextState.scrollTop < 52)

    }

    componentDidMount() {
        super.componentDidMount()
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    render() {

        return (
            <CustomScroll heightRelativeToParent="100%"
                heightMargin={35}
                allowOuterScroll
                threshold={300}
                isFetching={false}
                ref={r => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                hasMore={false}>

                <Header scrollTop={this.state.scrollTop} />

                <PageHeader title="Charts" />

                <div className="container-fluid charts">
                    <Nav className="tabs" tabs>
                        <NavLink
                            className={cn({ active: this.state.activeTab === '1' })}
                            onClick={() => {
                                this.toggle('1')
                            }}
                            activeClassName="active">Music</NavLink>
                        <NavLink
                            className={cn({ active: this.state.activeTab === '2' })}
                            onClick={() => {
                                this.toggle('2')
                            }}
                            activeClassName="active">Audio</NavLink>
                    </Nav>

                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <div>
                                <Masonry
                                    breakpointCols={{
                                        default: 5,
                                        1400: 4,
                                        1100: 3,
                                        700: 2,
                                        500: 1
                                      }}
                                    className="my-masonry-grid">
                                    {MUSIC_GENRES.map((genre) => (
                                        <ChartGenre key={genre.key} genre={genre} img={GENRE_IMAGES[genre.key]} />
                                    ))}
                                </Masonry>

                            </div>
                        </TabPane>
                        <TabPane tabId="2">
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
            </CustomScroll>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { ui } = state
    const { location, history } = props

    return {
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default withRouter(connect(mapStateToProps, actions)(ChartsPage))