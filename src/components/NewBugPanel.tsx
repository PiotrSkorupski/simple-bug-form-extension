import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Panel } from "azure-devops-ui/Panel";
import { INewBugPanelState } from "./NewBugPanel.State";
import { INewBugPanelProperties } from "./NewBugPanel.Props";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { FormItem } from "azure-devops-ui/FormItem";

const bugTitle = new ObservableValue<string>("");
const bugDescription = new ObservableValue<string>("");
const bugReproSteps = new ObservableValue<string>("");
const constBugTitleErrorMessage = "Bug title cannot be empty";
const constBugDescriptionErrorMessage = "Description cannot be empty";
const constReproStepsErorrMessage = "Repro steps cannot be empty";

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
            isFormValid: false,
            createButtonDisabled: true,
            cancelButtonDisabled: false,
            bugTitleErrorMessage: constBugTitleErrorMessage,
            bugDescriptionErrorMessage: constBugDescriptionErrorMessage,
            reproStepsErrorMessage: constReproStepsErorrMessage,
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
                                                this.setState ({isBugTitleError: false});
                                                this.setState ({bugTitleErrorMessage: ""});
                                            }
                                            else {
                                                this.setState ({isBugTitleError: true});
                                                this.setState ({bugTitleErrorMessage: constBugTitleErrorMessage});
                                            }
                                            this.updateFormValid();
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
                                                this.setState ({isBugDescriptionError: false});
                                                this.setState ({bugDescriptionErrorMessage: ""});
                                            }
                                            else
                                            {
                                                this.setState ({isBugDescriptionError: true});
                                                this.setState ({bugDescriptionErrorMessage: constBugDescriptionErrorMessage});
                                            }
                                            this.updateFormValid();
                                        }
                                    }
                                    multiline
                                    rows={4}
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
                                                this.setState ({isReproStepsError: false});
                                                this.setState ({reproStepsErrorMessage: ""});
                                            }
                                            else {
                                                this.setState ({isReproStepsError: true});
                                                this.setState ({reproStepsErrorMessage: constReproStepsErorrMessage});
                                            }
                                            this.updateFormValid();
                                        }
                                    }
                                    multiline
                                    rows={4}
                                    width={TextFieldWidth.standard}
                                    placeholder="Enter bug repro steps"
                                    disabled = {this.state.formInputsDisabled}
                                />
                            </FormItem>
                        </div>
                    </Panel>
                )}
            </div>
        );
    }

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
            var sampleWit = witClient.createWorkItem(JSON.parse(sampleWitJsonPatch), projectId, "bug").then(
                (sampleWit:any) => {
                    //this.props.fadeToast("Bug submitted sucessfully");
                    this.props.showDialog("Report a bug", "Bug submitted sucessfully");
                    this.clearForm();
                    console.log(sampleWit)
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
        //console.log("updateFormValid. BugTitleError: " + this.state.isBugTitleError + " DescError " + this.state.isBugDescriptionError + " ReproError " + this.state.isReproStepsError);
        if (!this.state.isBugTitleError && !this.state.isBugDescriptionError && !this.state.isReproStepsError) 
        {
            //console.log("Form valid");
            this.setState({isFormValid: true});
            this.setState({createButtonDisabled: false});
        } else {
            //console.log("Form not valid");
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