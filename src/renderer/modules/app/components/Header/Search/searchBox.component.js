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

        this.onChange = this.onChange.bind(this)
        this.focus = this.focus.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextState.query !== this.state.query
    }

    componentDidMount() {
        this.handleSearchDebounced = debounce(this.props.handleSearch, 150)

        ipcRenderer.on('keydown:search', this.focus)
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('keydown:search', this.focus)
    }

    setValue = (query) => {
        this.setState({query})
    }

    focus() {
        this.search.focus()
    }

    onChange(event) {
        this.handleSearchDebounced(this.state.query, this.search.value)
        this.setState({ query: event.target.value })
    }

    render() {
        const { className } = this.props

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
                       value={this.state.query}
                       onKeyPress={(e) => {
                           if(e.key === "Enter"){
                               this.handleSearchDebounced(this.state.query, this.search.value)
                           }
                       }}
                       onChange={this.onChange} />

                <div className="input-group-append">
                    <span className="input-group-text">
                        <i id="clear" className="input-group-addon icon-x" onClick={() => {
                            this.setState({ query: '' })
                            this.handleSearchDebounced()
                        }} />
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
}


SearchBox.defaultProps = {
    value: ''
}

export default SearchBox