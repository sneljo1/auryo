import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import cn from 'classnames'

class Sticky extends React.Component {
    constructor() {
        super()
        this.state = {
            scrollingLock: false
        }

        this.stickyRef = Math.floor(Math.random() * (100 - 0 + 1)) + 0 + 'sticky'
        this.handleScroll = this.handleScroll.bind(this)
        this.handleScrollDebounced = debounce(this.handleScroll, 10)
        this.calculateWidthDebounced = debounce(this.calculateWidth, 10)
    }

    componentDidMount() {

        window.addEventListener('scroll', this.handleScrollDebounced)
        if (!this.props.stickyWidth) {
            this.calculateWidth()
            window.addEventListener('resize', this.calculateWidthDebounced)
        }
        this.calculateScrollIndex()
    }

    componentWillMount() {
        this.setState({
            scrollingLock: false
        })
    }

    componentWillUnmount() {

        window.removeEventListener('scroll', this.handleScrollDebounced)
        window.removeEventListener('resize', this.calculateWidthDebounced)
    }

    calculateScrollIndex() {
        if (this.props.scrollIndex) {
            this.setState({
                scrollIndex: this.props.scrollIndex && this.props.scrollIndex
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

    calculateWidth() {
        if (this.stickyRef) {
            this.dimension = this.stickyRef.getBoundingClientRect()
            this.setState({
                width: this.dimension.width ? this.dimension.width : '100%'
            })
        }
    }

    handleScroll() {
        const scrollBuffer = 10


        const pageYOffset = window.pageYOffset

        if (pageYOffset + scrollBuffer > this.state.scrollIndex) {
            this.setState({
                scrollingLock: true
            })
        } else if (pageYOffset - scrollBuffer < this.state.scrollIndex) {
            this.setState({
                scrollingLock: false
            })
        }
    }

    render() {
        const lock = this.state.scrollingLock || this.props.isSticky

        if (lock) {
            return (
                <div
                    ref={r => this.stickyRef = r}
                >
                    <ReactCSSTransitionGroup
                        transitionName="sticky"
                        transitionAppear={true}
                        transitionEnterTimeout={1000}
                        transitionAppearTimeout={1000}
                        transitionLeaveTimeout={1000}
                    >
      <span
          className={cn(this.props.className, {
              [this.props.activeClassName]: lock
          })}
          style={{
              width: this.props.stickyWidth && lock ? this.props.stickyWidth : this.state.width,
              zIndex: 100000,
              position: lock ? 'fixed' : 'relative'
          }}
      >
      {this.props.children}
      </span>
                    </ReactCSSTransitionGroup>
                </div>
            )
        }

        return <div
            ref={r => this.stickyRef = r}
        >
      <span
          className={cn(this.props.className, {
              [this.props.activeClassName]: lock
          })}
          style={{
              width: this.props.stickyWidth && lock ? this.props.stickyWidth : this.state.width,
              zIndex: 100000,
              position: lock ? 'fixed' : 'relative'
          }}
      >
      {this.props.children}
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
    useWindow: PropTypes.bool,
    children: PropTypes.any
}

Sticky.defaultProps = {
    activeClassName: 'isSticky'
}

export default Sticky