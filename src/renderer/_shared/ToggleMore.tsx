import * as React from 'react';
import cn from 'classnames';

interface Props {
    height: number;
    className: string;
    children?: React.ReactNode;
}

interface State {
    open: boolean;
    overflow: boolean;
    check_height: number;
    max: number | null;
    current_height: number;
}

class ToggleMore extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        className: '',
        height: 200
    };

    private overflow: HTMLDivElement | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: false,
            overflow: false,
            check_height: props.height || 200,
            max: null,
            current_height: props.height || 200
        };
    }

    componentDidMount() {
        if (this.overflow) {
            const height = this.overflow.clientHeight;
            const { overflow, check_height } = this.state;

            if (height > check_height && !overflow) {
                this.setState({
                    overflow: true,
                    max: height
                });
            }
        }
    }

    toggleOpen = () => {
        const { open, current_height, max, check_height } = this.state;

        this.setState({
            open: !open,
            current_height: (current_height === max ? check_height : max) || 0
        });
    }

    render() {
        const { overflow, open, current_height } = this.state;
        const { className, children } = this.props;

        if (!overflow) {
            return (
                <div
                    ref={(r) => this.overflow = r}
                    className={className}
                >
                    {children}
                </div>
            );
        }

        return (
            <div className={cn('overflow-container', className, { open })}>
                <div
                    className='overflow-div'
                    ref={(r) => this.overflow = r}
                    style={{
                        height: current_height
                    }}
                >
                    {children}
                </div>
                <div className='overflow-bottom'>
                    <a className='overflow-button' href='javascript:void(0)' onClick={this.toggleOpen}>
                        <i className={`bx bx-${open ? 'chevron-up' : 'chevron-down'}`} />
                    </a>
                </div>
            </div>
        );
    }

}
export default ToggleMore;
