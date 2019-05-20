import * as React from "react";

export interface IViewBugPanelProperties {
    currentProjectName: string;
    currentCollectionName?: string;
    currentWitId?: number;
    showToast(): void;
    fadeToast(): void;
}