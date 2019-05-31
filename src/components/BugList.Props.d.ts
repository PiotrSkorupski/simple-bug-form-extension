import * as React from "react";

export interface IBugListProps {
    mode: string;
    forceRefreshBugList: boolean;
    showViewBugPanel(witId: number): void;
    hideViewBugPanel(witId: number): void;
}