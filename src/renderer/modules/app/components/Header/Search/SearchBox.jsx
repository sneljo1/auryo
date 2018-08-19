import React from 'react'
import PropTypes from 'prop-types'
import './searchBox.scss'
import debounce from 'lodash/debounce'
import { ipcRenderer } from 'electron'

class SearchBox extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            query: props.initialValue || props.value || ''
        }
    }

    componentDidMount() {
        const { handleSearch } = this.props;

        this.handleSearchDebounced = debounce(handleSearch, 150)

        ipcRenderer.on('keydown:search', this.focus)
    }

    shouldComponentUpdate(nextProps, nextState, ) {
        const { query } = this.state;

        return nextState.query !== query
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('keydown:search', this.focus)
    }

    setValue = (query) => {
        this.setState({ query })
    }

    focus = () => {
        this.search.focus()
    }

    onChange = (event) => {
        const { query } = this.state;

        this.handleSearchDebounced(query, this.search.value)
        this.setState({ query: event.target.value })
    }

    render() {
        const { className } = this.props
        const { query } = this.state

        return (
            <div id={className ? undefined : 'globalSearch'}
                className={`input-group search-box d-flex justify-content-center align-items-center ${className}`}>
                <div className="input-group-prepend">
                    <span className="input-group-text">
                        <i className="search icon-search2" />
                    </span>
                </div>
                <input ref={ref => this.search = ref} type="text"
                    className="form-control"
                    placeholder="Search people, tracks and albums"
                    value={query}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            this.handleSearchDebounced(query, this.search.value)
                        }
                    }}
                    onChange={this.onChange} />

                <div className="input-group-append">
                    <span className="input-group-text">
                        <a id="clear" href="javascript:void(0)" onClick={() => {
                            this.setState({ query: '' })
                            this.handleSearchDebounced()
                        }}>
                            <i id="clear" className="input-group-addon icon-x" />
                        </a>

                    </span>
                </div>

            </div>
        )
    }
}

SearchBox.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    className: PropTypes.string,
    initialValue: PropTypes.string,
    value: PropTypes.string,
}


SearchBox.defaultProps = {
    value: '',
    className: '',
    initialValue: null
}

export default SearchBox