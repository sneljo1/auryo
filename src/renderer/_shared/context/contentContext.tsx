import React, { FC, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';

export const INITIAL_LAYOUT_SETTINGS: LayoutSettings = {
  hasImage: false
};

export interface LayoutSettings {
  hasImage: boolean;
}

export type ContentContextProps = {
  settings: LayoutSettings;
  // For tracksgrid
  list?: RefObject<FixedSizeList | null>;

  // For other infinite lists
  applySettings(settings: Partial<LayoutSettings>): void;
};

export type InjectedContentContextProps = {
  settings: LayoutSettings;
  // For tracksgrid
  list?: FixedSizeList | null;

  // For other infinite lists
  applySettings(settings: Partial<LayoutSettings>): void;
};

export const ContentContext = React.createContext<ContentContextProps>({
  settings: INITIAL_LAYOUT_SETTINGS,
  applySettings: () => {
    throw new Error('applySettings() not implemented');
  }
});

export function withContentContext<P extends InjectedContentContextProps>(Component: React.ComponentType<P>) {
  return (props: Pick<P, Exclude<keyof P, keyof ContentContextProps>>) => {
    return (
      <ContentContext.Consumer>
        {context => <Component {...(props as P)} settings={context.settings} applySettings={context.applySettings} />}
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

export const useContentContext = () => useContext(ContentContext);

export const ContentContextProvider: FC = ({ children }) => {
  const [settings, setSettings] = useState(INITIAL_LAYOUT_SETTINGS);
  const list = useRef<FixedSizeList | null>(null);

  const value = useMemo(
    (): ContentContextProps => ({
      settings,
      list,
      applySettings: newSettings => setSettings(oldSettings => ({ ...oldSettings, ...newSettings }))
    }),
    [list, settings]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};
