import * as React from "react";

export interface IBugListProps {
    mode: string;
    showViewBugPanel(witId: number): void;
    hideViewBugPanel(witId: number): void;
}