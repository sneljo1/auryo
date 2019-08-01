import { ipcRenderer } from "electron";
import { debounce } from "lodash";
import * as React from "react";
import "./SearchBox.scss";

interface Props {
    className?: string;
    initialValue?: string;
    value?: string;
    handleSearch?(previousQuery: string, currentValue?: string): void;
}

interface State {
    query: string;
}

class SearchBox extends React.Component<Props, State> {

    public static readonly defaultProps: Partial<Props> = {
        value: "",
        className: "globalSearch",
        initialValue: ""
    };

    private readonly handleSearchDebounced: (oldValue: string, currentValue?: string) => void;
    private search: HTMLInputElement | null = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            query: props.initialValue || props.value || ""
        };

        this.handleSearchDebounced = debounce(this.handleSearch, 250);
    }

    public componentDidMount() {
        ipcRenderer.on("keydown:search", this.focus);
    }

    public shouldComponentUpdate(_nextProps: Props, nextState: State) {
        const { query } = this.state;

        return nextState.query !== query;
    }

    public componentWillUnmount() {
        ipcRenderer.removeListener("keydown:search", this.focus);
    }

    public handleSearch(oldValue: string, currentValue?: string) {
        const { handleSearch } = this.props;

        if (handleSearch) {
            handleSearch(oldValue, currentValue);
        }
    }

    public setValue = (query: string) => {
        this.setState({ query });
    }

    public focus = () => {
        if (this.search) {
            this.search.focus();
        }
    }

    public onChange = (event: React.FormEvent<HTMLInputElement>) => {

        if (this.search) {
            this.handleSearchDebounced(this.state.query, event.currentTarget.value);
        }

        this.setState({ query: event.currentTarget.value });
    }

    public onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            this.handleSearchDebounced(this.state.query, event.currentTarget.value);
        }
    }

    public render() {
        const { className } = this.props;
        const { query } = this.state;

        return (
            <div
                id={className}
                className={`input-group search-box d-flex justify-content-center align-items-center ${className}`}
            >
                <div className="input-group-prepend">
                    <span className="input-group-text">
                        <i className="bx bx-search" />
                    </span>
                </div>
                <input
                    ref={(ref) => this.search = ref}
                    type="text"
                    className="form-control"
                    placeholder="Search people, tracks and albums"
                    value={query}
                    onKeyPress={this.onKeyPress}
                    onChange={this.onChange}
                />

                <div className="input-group-append">
                    <span className="input-group-text">
                        <a
                            id="clear"
                            href="javascript:void(0)"
                            onClick={() => {
                                this.setState({ query: "" });
                                this.handleSearchDebounced(this.state.query);
                            }}
                        >
                            <i id="clear" className="input-group-addon bx bx-x" />
                        </a>

                    </span>
                </div>

            </div>
        );
    }
}

export default SearchBox;
