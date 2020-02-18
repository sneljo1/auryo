import React, { useEffect } from 'react';
import { FixedSizeList } from 'react-window';

export const INITIAL_LAYOUT_SETTINGS: LayoutSettings = {
  hasImage: false
};

export interface LayoutSettings {
  hasImage: boolean;
}

type ContentContextProps = {
  settings: LayoutSettings;
  // For tracksgrid
  list?: FixedSizeList | null;
  setList(list: FixedSizeList | null): void;

  // For other infinite lists
  applySettings(settings: Partial<LayoutSettings>): void;
};

export type InjectedContentContextProps = {
  settings: LayoutSettings;
  // For tracksgrid
  list?: FixedSizeList | null;
  setList(list: FixedSizeList | null): void;

  // For other infinite lists
  applySettings(settings: Partial<LayoutSettings>): void;
};

export const ContentContext = React.createContext<ContentContextProps>({
  settings: INITIAL_LAYOUT_SETTINGS,
  setList: () => {
    throw new Error('setList() not implemented');
  },
  applySettings: () => {
    throw new Error('applySettings() not implemented');
  }
});

export function withContentContext<P extends InjectedContentContextProps>(Component: React.ComponentType<P>) {
  return (props: Pick<P, Exclude<keyof P, keyof ContentContextProps>>) => {
    return (
      <ContentContext.Consumer>
        {context => (
          <Component
            {...(props as P)}
            settings={context.settings}
            setList={context.setList}
            applySettings={context.applySettings}
          />
        )}
      </ContentContext.Consumer>
    );
  };
}

interface SetLayoutSettingsComponentProps extends InjectedContentContextProps {
  hasImage: boolean;
}

const SetLayoutSettingsComponent: React.SFC<SetLayoutSettingsComponentProps> = ({ hasImage, applySettings }) => {
  useEffect(() => {
    applySettings({ hasImage });

    return () => {
      applySettings(INITIAL_LAYOUT_SETTINGS);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasImage]);

  return null;
};

export const SetLayoutSettings = withContentContext(SetLayoutSettingsComponent);
