import * as React from "react";

export interface IViewBugPanelProperties {
    currentProjectName: string;
    currentCollectionName?: string;
    currentWitId?: number;
    showDialog(title?:string, message?: string): void;
    forceRefreshBugList():void;
}