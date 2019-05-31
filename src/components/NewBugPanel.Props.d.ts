import * as React from "react";

export interface INewBugPanelProperties {
    currentProjectName: string;
    currentCollectionName?: string;
    showDialog(title?:string, message?: string): void;
    forceRefreshBugList():void;
}