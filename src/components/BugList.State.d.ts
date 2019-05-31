import * as React from "react";
import { ITableItem } from "./BugListTableData";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

export interface IBugListState {
    tableContents: ObservableArray<ITableItem>;
    rawTableContents: ITableItem[];
    mode: string;
    dummy: string;
    dummyFlag: boolean;
}