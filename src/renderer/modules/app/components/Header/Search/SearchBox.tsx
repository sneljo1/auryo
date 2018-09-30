import { ipcRenderer } from 'electron';
import debounce from 'lodash/debounce';
import React from 'react';

interface Props {
    handleSearch?: (previousQuery: string, currentValue?: string) => void;
    className?: string;
    initialValue?: string;
    value?: string;
}

interface State {
    query: string;
}

class SearchBox extends React.Component<Props, State> {

    static defaultProps = {
        value: '',
        className: '',
        initialValue: null
    };

    private handleSearchDebounced: Function;
    private search: HTMLInputElement | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            query: props.initialValue || props.value || ''
        };

        this.handleSearchDebounced = debounce(this.handleSearch, 150);
    }

    componentDidMount() {
        ipcRenderer.on('keydown:search', this.focus);
    }

    shouldComponentUpdate(_nextProps: Props, nextState: State) {
        const { query } = this.state;

        return nextState.query !== query;
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('keydown:search', this.focus);
    }

    handleSearch(currentValue: string) {
        const { handleSearch } = this.props;
        const { query } = this.state;


        if (handleSearch) {
            handleSearch(query, currentValue);
        }
    }

    setValue = (query: string) => {
        this.setState({ query });
    }

    focus = () => {
        if (this.search) {
            this.search.focus();
        }
    }

    onChange = (event: React.FormEvent<HTMLInputElement>) => {

        if (this.search) {
            this.handleSearchDebounced(event.currentTarget.value);
        }

        this.setState({ query: event.currentTarget.value });
    }
    onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            this.handleSearchDebounced(event.currentTarget.value);
        }
    }

    render() {
        const { className } = this.props;
        const { query } = this.state;

        return (
            <div id={className ? undefined : 'globalSearch'}
                className={`input-group search-box d-flex justify-content-center align-items-center ${className}`}>
                <div className='input-group-prepend'>
                    <span className='input-group-text'>
                        <i className='search icon-search2' />
                    </span>
                </div>
                <input ref={(ref) => this.search = ref} type='text'
                    className='form-control'
                    placeholder='Search people, tracks and albums'
                    value={query}
                    onKeyPress={this.onKeyPress}
                    onChange={this.onChange} />

                <div className='input-group-append'>
                    <span className='input-group-text'>
                        <a id='clear' href='javascript:void(0)' onClick={() => {
                            this.setState({ query: '' });
                            this.handleSearchDebounced();
                        }}>
                            <i id='clear' className='input-group-addon icon-x' />
                        </a>

                    </span>
                </div>

            </div>
        );
    }
}

export default SearchBox;
