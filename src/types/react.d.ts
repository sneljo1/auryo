import { StatelessComponent, SFCElement } from "react";

declare module "react" {
    function memo<P>(
        type: StatelessComponent<P>,
        compare?: (oldProps: P, newProps: P) => boolean
    ): SFC<P>;
}