import * as React from "react";

export interface INewBugPanelProperties {
    currentProjectName: string;
    currentCollectionName?: string;
    showToast(): void;
    fadeToast(): void;
}