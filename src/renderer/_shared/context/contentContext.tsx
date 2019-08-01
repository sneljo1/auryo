import * as React from "react";
import { FixedSizeList } from "react-window";

type ContentContextProps = {
  list?(): FixedSizeList | null;
  setList(getListRef: () => FixedSizeList | null): void;
};

export type InjectedContentContextProps = {
  setList(getListRef: () => FixedSizeList | null): void;
};

export const ContentContext = React.createContext<ContentContextProps>({
  setList: _list => {
    throw new Error("setList() not implemented");
  }
});

export function withContentContext<P extends InjectedContentContextProps>(Component: React.ComponentType<P>) {
  return (props: Pick<P, Exclude<keyof P, keyof ContentContextProps>>) => {
    return (
      <ContentContext.Consumer>
        {(context) => <Component {...props as P} setList={context.setList} />}
      </ContentContext.Consumer>
    )
  }
}
