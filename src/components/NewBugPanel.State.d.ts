import * as React from "react";

export interface INewBugPanelState {
    expanded: boolean;
    isBugTitleError: boolean;
    bugTitleErrorMessage: string;
    isBugDescriptionError: boolean;
    bugDescriptionErrorMessage: string;
    isReproStepsError: boolean;
    reproStepsErrorMessage: string;
    isSeverityError:boolean;
    severityErrorMessage: string;
    isFormValid: boolean;
    createButtonDisabled: boolean;
    cancelButtonDisabled: boolean;
    formInputsDisabled: boolean;
}