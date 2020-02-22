import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { debounce } from 'lodash';
import React from 'react';
import './SearchBox.scss';

interface Props {
  className?: string;
  initialValue?: string;
  value?: string;
  handleSearch?(previousQuery: string, currentValue?: string): void;
}

interface State {
  query: string;
}

@autobind
class SearchBox extends React.Component<Props, State> {
  private readonly handleSearchDebounced: (oldValue: string, currentValue?: string) => void;
  private searchInput = React.createRef<HTMLInputElement>();
  public static readonly defaultProps: Partial<Props> = {
    value: '',
    className: 'globalSearch',
    initialValue: ''
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      query: props.initialValue || props.value || ''
    };

    this.handleSearchDebounced = debounce(this.handleSearch, 250);
  }

  public componentDidMount() {
    ipcRenderer.on('keydown:search', this.focus);
  }

  public shouldComponentUpdate(_nextProps: Props, nextState: State) {
    const { query } = this.state;

    return nextState.query !== query;
  }

  public componentWillUnmount() {
    ipcRenderer.removeListener('keydown:search', this.focus);
  }

  public onChange(event: React.FormEvent<HTMLInputElement>) {
    const { query } = this.state;

    if (this.searchInput.current) {
      this.handleSearchDebounced(query, event.currentTarget.value);
    }

    this.setState({ query: event.currentTarget.value });
  }

  public onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    const { query } = this.state;

    if (event.key === 'Enter') {
      this.handleSearchDebounced(query, event.currentTarget.value);
    }
  }

  public setValue(query: string) {
    this.setState({ query });
  }

  public handleSearch(oldValue: string, currentValue?: string) {
    const { handleSearch } = this.props;

    if (handleSearch) {
      handleSearch(oldValue, currentValue);
    }
  }

  public focus() {
    if (this.searchInput.current) {
      this.searchInput.current.focus();
    }
  }

  public render() {
    const { className } = this.props;
    const { query } = this.state;

    return (
      <div
        id={className}
        className={`input-group search-box d-flex justify-content-center align-items-center ${className}`}>
        <div className="input-group-prepend">
          <span className="input-group-text">
            <i className="bx bx-search" />
          </span>
        </div>
        <input
          ref={this.searchInput}
          type="text"
          className="form-control"
          placeholder="Search people, tracks and albums"
          value={query}
          onKeyPress={this.onKeyPress}
          onKeyUp={e => e.stopPropagation()}
          onChange={this.onChange}
        />

        <div className="input-group-append">
          <span className="input-group-text">
            <a
              id="clear"
              href="javascript:void(0)"
              onClick={() => {
                this.setState({ query: '' });
                this.handleSearchDebounced(query);
              }}>
              <i id="clear" className="input-group-addon bx bx-x" />
            </a>
          </span>
        </div>
      </div>
    );
  }
}

export default SearchBox;
