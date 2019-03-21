import * as React from 'react';
import { LightTheme, DarkTheme, BlueTheme } from './themes/index';

class Theme extends React.Component {
  node = React.createRef();

  componentDidMount() {
    this.updateCSSVariables();
  }

  componentDidUpdate(prevProps) {
    if (this.props.variables !== prevProps.variables) {
      this.updateCSSVariables();
    }
  }

  updateCSSVariables() {
    Object.entries(this.props.variables).forEach(([prop, value]) => this.node.current.style.setProperty(prop, value));
  }

  render() {
    const { children } = this.props;
    return <div ref={this.node}>{children}</div>;
  }
}

Theme.light = LightTheme;
Theme.dark = DarkTheme;
Theme.blue = BlueTheme;

export default Theme;
