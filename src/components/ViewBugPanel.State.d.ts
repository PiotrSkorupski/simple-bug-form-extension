import * as React from "react";

export interface IViewBugPanelState {
    expanded: boolean;
    resolveButtonDisabled: boolean;
    rejectButtonDisabled: boolean;
    dialogRejectButtonDisabled: boolean;
    rejectReasonError: string;
    isRejectReasonError: boolean;
}