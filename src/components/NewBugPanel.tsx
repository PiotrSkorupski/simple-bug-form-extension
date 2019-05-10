import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Panel } from "azure-devops-ui/Panel";
import { INewBugPanelState } from "./NewBugPanel.Props";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { FormItem } from "azure-devops-ui/FormItem";
//import * as SDK from "azure-devops-extension-sdk";
//import { CommonServiceIds, getClient, IProjectPageService } from "azure-devops-extension-api";
//import { IWorkItemFormNavigationService, WorkItemTrackingRestClient, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
//const vss = require('VSS');
//import * from "vss-web-extension-sdk";
// import RestClient = require("TFS/Work/RestClient");
// import CoreContracts = require("TFS/Core/Contracts");
// import WorkContracts = require("TFS/Work/Contracts");
// import RestClientWI = require("TFS/WorkItemTracking/RestClient");

const bugTitle = new ObservableValue<string>("");
const bugDescription = new ObservableValue<string>("");
const bugReproSteps = new ObservableValue<string>("");
const constBugTitleErrorMessage = "Bug title cannot be empty";
const constBugDescriptionErrorMessage = "Description cannot be empty";
const constReproStepsErorrMessage = "Repro steps cannot be empty";

export class NewBugPanel extends React.Component<{}, INewBugPanelState> {
    constructor(props: {}) {
        super(props);
        this.state = { 
            expanded: false,
            isBugTitleError: true,
            isBugDescriptionError: true,
            isReproStepsError: true,
            isFormValid: false,
            createButtonDisabled: true,
            bugTitleErrorMessage: constBugTitleErrorMessage,
            bugDescriptionErrorMessage: constBugDescriptionErrorMessage,
            reproStepsErrorMessage: constReproStepsErorrMessage
        };
    }

    public componentDidMount() {
        console.log("NewBugPanel componentDidMount");
        //SDK.init();
        //vss.init();
    }

    public render(): JSX.Element {
        console.log("Render NewBugPanel");
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
                            { text: "Cancel", onClick: () => this.setState({ expanded: false }) },
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

    private async createNewBug() {
        console.log("NewBugPanel.createNewBug. Bug title: " + bugTitle.value);

        //console.log('Submit a bug clicked: ' + SDK.getExtensionContext().id + ".panel-content");

        //const sdkHost = await SDK.getHost();
        //const sdkUser = await SDK.getUser();
        //console.log('SDK Init. Collection: ' + sdkHost.name + ' Type: ' + sdkHost.type + ' ID: ' + sdkHost.id + ' User: ' + sdkUser.displayName);


        //const witSvc = await SDK.getService<IWorkItemFormNavigationService>(WorkItemTrackingServiceIds.WorkItemFormNavigationService);
        // var item = witSvc.openWorkItem(4);
        // VSS.init(
        //     {
        //         explicitNotifyLoaded: true,
        //         usePlatformScripts: true
        //     }
        // );

        // console.log("VSS user context: " + VSS.getWebContext().user.name);

        //VSS.getService()

        //var client = RestClient.getClient();
        //var clientwi = RestClientWI.getClient();

        //clientwi.getWorkItem(4).then((wi) => {
        //    console.log("Got work item: " + wi.fields["System.Title"]);
        //});
        
    }

    private updateFormValid(): void {
        console.log("updateFormValid. BugTitleError: " + this.state.isBugTitleError + " DescError " + this.state.isBugDescriptionError + " ReproError " + this.state.isReproStepsError);
        if (!this.state.isBugTitleError && !this.state.isBugDescriptionError && !this.state.isReproStepsError) 
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