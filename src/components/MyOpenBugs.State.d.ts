import * as React from "react";
import { ITableItem } from "./MyOpenBugsTableData";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

export interface IMyOpenBugsState {
    tableContents: ObservableArray<ITableItem>;
}