import { ipcRenderer } from 'electron';
import { debounce } from 'lodash';
import * as React from 'react';

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
        className: 'globalSearch',
        initialValue: null
    };

    private handleSearchDebounced: (oldValue: string, currentValue?: string) => void;
    private search: HTMLInputElement | null = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            query: props.initialValue || props.value || ''
        };

        this.handleSearchDebounced = debounce(this.handleSearch, 250);
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

    handleSearch(oldValue: string, currentValue?: string) {
        const { handleSearch } = this.props;

        if (handleSearch) {
            handleSearch(oldValue, currentValue);
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
            this.handleSearchDebounced(this.state.query, event.currentTarget.value);
        }

        this.setState({ query: event.currentTarget.value });
    }

    onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            this.handleSearchDebounced(this.state.query, event.currentTarget.value);
        }
    }

    render() {
        const { className } = this.props;
        const { query } = this.state;

        return (
            <div
                id={className}
                className={`input-group search-box d-flex justify-content-center align-items-center ${className}`}
            >
                <div className='input-group-prepend'>
                    <span className='input-group-text'>
                        <i className='search icon-search2' />
                    </span>
                </div>
                <input
                    ref={(ref) => this.search = ref}
                    type='text'
                    className='form-control'
                    placeholder='Search people, tracks and albums'
                    value={query}
                    onKeyPress={this.onKeyPress}
                    onChange={this.onChange}
                />

                <div className='input-group-append'>
                    <span className='input-group-text'>
                        <a
                            id='clear'
                            href='javascript:void(0)'
                            onClick={() => {
                                this.setState({ query: '' });
                                this.handleSearchDebounced(this.state.query);
                            }}
                        >
                            <i id='clear' className='input-group-addon icon-x' />
                        </a>

                    </span>
                </div>

            </div>
        );
    }
}

export default SearchBox;
