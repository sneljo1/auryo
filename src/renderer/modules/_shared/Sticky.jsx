import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import cn from 'classnames'

class Sticky extends React.Component {

    constructor() {
        super()

        this.stickyRef = `${Math.floor(Math.random() * (100 - 0 + 1)) + 0}sticky`
        this.handleScrollDebounced = debounce(this.handleScroll, 10)
        this.calculateWidthDebounced = debounce(this.calculateWidth, 10)
    }

    state = {
        scrollingLock: false
    }

    componentWillMount() {
        this.setState({
            scrollingLock: false
        })
    }

    componentDidMount() {
        const { stickyWidth } = this.props

        window.addEventListener('scroll', this.handleScrollDebounced)
        if (!stickyWidth) {
            this.calculateWidth()
            window.addEventListener('resize', this.calculateWidthDebounced)
        }
        this.calculateScrollIndex()
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScrollDebounced)
        window.removeEventListener('resize', this.calculateWidthDebounced)
    }

    calculateScrollIndex = () => {
        const { scrollIndex } = this.props;

        if (scrollIndex) {
            this.setState({
                scrollIndex: scrollIndex && scrollIndex
            })
        }

        else if (this.stickyRef) {
            this.dimension = this.stickyRef.getBoundingClientRect()
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            this.setState({
                scrollIndex: this.dimension.top ? this.dimension.top + scrollTop : '1'
            })
        }
    }

    calculateWidth = () => {
        if (this.stickyRef) {
            this.dimension = this.stickyRef.getBoundingClientRect()
            this.setState({
                width: this.dimension.width ? this.dimension.width : '100%'
            })
        }
    }

    handleScroll = () => {
        const { scrollIndex } = this.state;
        const { pageYOffset } = window;
        const scrollBuffer = 10

        if (pageYOffset + scrollBuffer > scrollIndex) {
            this.setState({
                scrollingLock: true
            })
        } else if (pageYOffset - scrollBuffer < scrollIndex) {
            this.setState({
                scrollingLock: false
            })
        }
    }

    render() {
        const { children, isSticky, stickyWidth, activeClassName, className } = this.props;
        const { scrollingLock, width } = this.state;
        const lock = scrollingLock || isSticky

        if (lock) {
            return (
                <div
                    ref={r => this.stickyRef = r}
                >
                    <ReactCSSTransitionGroup
                        transitionName="sticky"
                        transitionAppear
                        transitionEnterTimeout={1000}
                        transitionAppearTimeout={1000}
                        transitionLeaveTimeout={1000}
                    >
                        <span
                            className={cn(className, {
                                [activeClassName]: lock
                            })}
                            style={{
                                width: stickyWidth && lock ? stickyWidth : width,
                                zIndex: 100000,
                                position: lock ? 'fixed' : 'relative'
                            }}
                        >
                            {children}
                        </span>
                    </ReactCSSTransitionGroup>
                </div>
            )
        }

        return <div
            ref={r => this.stickyRef = r}
        >
            <span
                className={cn(className, {
                    [activeClassName]: lock
                })}
                style={{
                    width: stickyWidth && lock ? stickyWidth : width,
                    zIndex: 100000,
                    position: lock ? 'fixed' : 'relative'
                }}
            >
                {children}
            </span>
        </div>
    }
}

Sticky.propTypes = {
    className: PropTypes.any,
    activeClassName: PropTypes.any,
    scrollIndex: PropTypes.number,
    stickyWidth: PropTypes.string,
    isSticky: PropTypes.bool,
    children: PropTypes.any
}

Sticky.defaultProps = {
    activeClassName: 'isSticky',
    className: "",
    children: null,
    isSticky: false,
    stickyWidth: null,
    scrollIndex: null,
}

export default Sticky