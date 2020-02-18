import cn from 'classnames';
import React from 'react';

interface Props {
  height: number;
  className: string;
  children?: React.ReactNode;
}

interface State {
  open: boolean;
  overflow: boolean;
  checkHeight: number;
  max: number | null;
  currentHeight: number;
}

export class ToggleMore extends React.PureComponent<Props, State> {
  private overflow = React.createRef<HTMLDivElement>();
  public static defaultProps: Partial<Props> = {
    className: '',
    height: 200
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      open: false,
      overflow: false,
      checkHeight: props.height || 200,
      max: null,
      currentHeight: props.height || 200
    };
  }

  public componentDidMount() {
    if (this.overflow.current) {
      const height = this.overflow.current.clientHeight;
      const { overflow, checkHeight } = this.state;

      if (height > checkHeight && !overflow) {
        this.setState({
          overflow: true,
          max: height
        });
      }
    }
  }

  public toggleOpen = () => {
    const { open, currentHeight, max, checkHeight } = this.state;

    this.setState({
      open: !open,
      currentHeight: (currentHeight === max ? checkHeight : max) || 0
    });
  };

  public render() {
    const { overflow, open, currentHeight } = this.state;
    const { className, children } = this.props;

    if (!overflow) {
      return (
        <div ref={this.overflow} className={className}>
          {children}
        </div>
      );
    }

    return (
      <div className={cn('overflow-container', className, { open })}>
        <div
          className="overflow-div"
          ref={this.overflow}
          style={{
            height: currentHeight
          }}>
          {children}
        </div>
        <div className="overflow-bottom">
          <a className="overflow-button" href="javascript:void(0)" onClick={this.toggleOpen}>
            <i className={`bx bx-${open ? 'chevron-up' : 'chevron-down'}`} />
          </a>
        </div>
      </div>
    );
  }
}
