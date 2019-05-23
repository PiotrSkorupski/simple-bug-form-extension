import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Panel } from "azure-devops-ui/Panel";
import { INewBugPanelState } from "./NewBugPanel.State";
import { INewBugPanelProperties } from "./NewBugPanel.Props";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { FormItem } from "azure-devops-ui/FormItem";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Observer } from "azure-devops-ui/Observer";


import restContractDefinitions = require('TFS/WorkItemTracking/Contracts');
import restClientDefinitions = require('TFS/WorkItemTracking/RestClient');

const bugTitle = new ObservableValue<string>("");
const bugDescription = new ObservableValue<string>("");
const bugReproSteps = new ObservableValue<string>("");
const bugSeverity = new ObservableValue<string>("");
const constBugTitleErrorMessage = "Bug title cannot be empty";
const constBugDescriptionErrorMessage = "Description cannot be empty";
const constReproStepsErorrMessage = "Repro steps cannot be empty";
const constSeverityErorrMessage = "Choose severity";

interface IBugWitPatch {
    op: string;
    path: string;
    value: string;
    from: string | null;
}

interface IBugWitPatchArray extends Array<IBugWitPatch>{}


export class NewBugPanel extends React.Component<INewBugPanelProperties, INewBugPanelState> {
    constructor(props: INewBugPanelProperties) {
        super(props);
        this.state = { 
            expanded: false,
            isBugTitleError: true,
            isBugDescriptionError: true,
            isReproStepsError: true,
            isSeverityError:true,
            isFormValid: false,
            createButtonDisabled: true,
            cancelButtonDisabled: false,
            bugTitleErrorMessage: constBugTitleErrorMessage,
            bugDescriptionErrorMessage: constBugDescriptionErrorMessage,
            reproStepsErrorMessage: constReproStepsErorrMessage,
            severityErrorMessage: constSeverityErorrMessage,
            formInputsDisabled: false
        };
    }

    public render(): JSX.Element {
        return (
            <div>
                {this.state.expanded && (
                    <Panel
                        onDismiss={() => this.setState({ expanded: false })}
                        titleProps={{ text: "Bug report from" }}
                        description={
                            "To report a bug or issue, please fill below form and click Create button."
                        }
                        footerButtonProps={[
                            { text: "Cancel", onClick: () => this.setState({ expanded: false }), disabled: this.state.createButtonDisabled },
                            { text: "Create", primary: true, onClick: () => this.createNewBug(), disabled: this.state.createButtonDisabled }
                        ]}
                    >
                        <div style={{ height: "1200px" }}>
                            <FormItem message={this.state.bugTitleErrorMessage} error={this.state.isBugTitleError} label={"Bug Title"}>
                                <TextField
                                    value={bugTitle}
                                    onChange={(e, newValue) => {
                                            bugTitle.value = newValue;
                                            if (this.isNotEmptyOrNull(newValue)) {
                                                this.setState ({isBugTitleError: false, bugTitleErrorMessage: ""},
                                                    ()=>{this.updateFormValid()}
                                                )
                                            }
                                            else {
                                                this.setState ({isBugTitleError: true, bugTitleErrorMessage: constBugTitleErrorMessage},
                                                    ()=>{this.updateFormValid()}
                                                );
                                            }
                                        }
                                    }
                                    placeholder="Enter bug title"
                                    width={TextFieldWidth.standard}
                                    disabled = {this.state.formInputsDisabled}
                                />
                            </FormItem>
                            <br/>
                            <FormItem message={this.state.bugDescriptionErrorMessage} error={this.state.isBugDescriptionError} label={"Bug Description"}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugDescription}
                                    onChange={(e, newValue) => 
                                        {
                                            bugDescription.value = newValue
                                            if (this.isNotEmptyOrNull(newValue)) {
                                                this.setState ({isBugDescriptionError: false, bugDescriptionErrorMessage: ""},
                                                    ()=>{this.updateFormValid()}
                                            );
                                                
                                            }
                                            else
                                            {
                                                this.setState ({isBugDescriptionError: true, bugDescriptionErrorMessage: constBugDescriptionErrorMessage}, 
                                                    ()=>{this.updateFormValid()});
                                            }
                                            this.updateFormValid();
                                        }
                                    }
                                    multiline
                                    rows={8}
                                    width={TextFieldWidth.standard}
                                    placeholder="Enter bug description"
                                    disabled = {this.state.formInputsDisabled}
                                />
                            </FormItem>
                            <br/>
                            <FormItem message={this.state.reproStepsErrorMessage} error={this.state.isReproStepsError} label={"Repro Steps"}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugReproSteps}
                                    onChange={(e, newValue) => 
                                        {
                                            bugReproSteps.value = newValue
                                            if (this.isNotEmptyOrNull(newValue)) {
                                                this.setState ({isReproStepsError: false, reproStepsErrorMessage: ""},
                                                    ()=>{this.updateFormValid()}
                                                );
                                                
                                            }
                                            else {
                                                this.setState ({isReproStepsError: true, reproStepsErrorMessage: constReproStepsErorrMessage},
                                                    ()=>{this.updateFormValid()}
                                                );
                                                
                                            }
                                            this.updateFormValid();
                                        }
                                    }
                                    multiline
                                    rows={8}
                                    width={TextFieldWidth.standard}
                                    placeholder="Enter bug repro steps"
                                    disabled = {this.state.formInputsDisabled}
                                />
                            </FormItem><br/>
                            <FormItem message={this.state.severityErrorMessage} error={this.state.isSeverityError} label={"Severity"}>
                                <Dropdown
                                    placeholder="Select severity"
                                    items={[
                                        { id: "2 - High", text: "High" },
                                        { id: "3 - Medium", text: "Medium" },
                                        { id: "4 - Low", text: "Low" }
                                    ]}
                                    onSelect={this.onSelect}
                                />
                            </FormItem>
                        </div>
                    </Panel>
                )}
            </div>
        );
    }

    private onSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        console.log("Severity set to: " + item.id);
        bugSeverity.value = item.id || "";
        this.setState ({isSeverityError: false, severityErrorMessage: ""},
        ()=>{
            this.updateFormValid();
        });
    };

    public showPanel() {
        this.setState({expanded: true})
    }

    private createNewBug() {
        console.log("NewBugPanel.createNewBug. Bug title: " + bugTitle.value);
        let currentProjectName = this.props.currentProjectName;

        //Starting to create bug. Disable Create and Cancel buttons
        this.setState({
            createButtonDisabled: true,
            cancelButtonDisabled: true,
            formInputsDisabled: true
        })

        //Create JSON Patch object
        var bugWitPatchArray: IBugWitPatchArray = [{
            op: "add",
            path: "/fields/System.Title",
            from: null,
            value: bugTitle.value
        },
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.ReproSteps",
            from: null,
            value: bugReproSteps.value
        },
        {
            op: "add",
            path:"/fields/System.Tags",
            from:null,
            value: "UserBug"
        },
        {
            op: "add",
            path:"/fields/Microsoft.VSTS.Common.Severity",
            from:null,
            value: bugSeverity.value
        }
        ];

        //Create JSON Patch object
        var tcWitPatchArray: IBugWitPatchArray = [{
            op: "add",
            path: "/fields/System.Title",
            from: null,
            value: bugTitle.value
        },
        // {
        //     op: "add",
        //     path: "/fields/Microsoft.VSTS.TCM.ReproSteps",
        //     from: null,
        //     value: bugReproSteps.value
        // },
        {
            op: "add",
            path:"/fields/System.Tags",
            from:null,
            value: "BugTestCase"
        }
        ];

        //Show toast
        //this.props.showToast("Submitting a bug");

        var projectId = VSS.getWebContext().project.id;

        console.log("Creating new bug in project: " + projectId)
        VSS.require(["TFS/WorkItemTracking/RestClient"], (witRestClient:any) => {
            var witClient = witRestClient.getClient();

            //var sampleWitJsonPatch = '[{"op": "add","path": "/fields/System.Title","from": null,"value": "Sample task"}]';
            var sampleWitJsonPatch = JSON.stringify(bugWitPatchArray);
            var testCaseWitJsonPath = JSON.stringify(tcWitPatchArray);
            console.log("Creating bug: " + sampleWitJsonPatch);
            var sampleWit = witClient.createWorkItem(JSON.parse(sampleWitJsonPatch), projectId, "bug").then(
                (sampleWit:any) => {
                    var testCase = witClient.createWorkItem(JSON.parse(testCaseWitJsonPath), projectId, "Test Case").then(
                        (tcWit:any) => {
                            //this.props.fadeToast("Bug submitted sucessfully");
                            this.props.showDialog("Report a bug", "Bug submitted sucessfully");
                            this.clearForm();
                            this.props.refreshBugList();
                            console.log(sampleWit) 
                        }
                    )
                }
            );
        });

        //Hide panel
        this.setState({expanded: false});    
        
    }

    clearForm() {
        this.setState({
            createButtonDisabled: true,
            cancelButtonDisabled: false,
            formInputsDisabled: false,
            isBugTitleError: true,
            isBugDescriptionError: true,
            isReproStepsError: true,
            isFormValid: false
        })
        bugTitle.value = "";
        bugDescription.value = "";
        bugReproSteps.value = "";
    }

    private updateFormValid(): void {
        console.log("updateFormValid. BugTitleError: " + this.state.isBugTitleError + " DescError " + this.state.isBugDescriptionError + " ReproError " + this.state.isReproStepsError);
        if (!this.state.isBugTitleError && !this.state.isBugDescriptionError && !this.state.isReproStepsError && !this.state.isSeverityError) 
        {
            console.log("Form valid");
            this.setState({isFormValid: true});
            this.setState({createButtonDisabled: false});
        } else {
            console.log("Form not valid");
            this.setState({isFormValid: false});
            this.setState({createButtonDisabled: true});
        }
    }

    private isNotEmptyOrNull(newValue: string): boolean {
        console.log("isNotEmptyOrNull. Value: " + newValue + " Value length: " + newValue.length);
        if (newValue && 0 < newValue.length) {
            console.log("isNotEmptyOrNull true");
            return true;
        } else {
            console.log("isNotEmptyOrNull false");
            return false;
        }
    }
}