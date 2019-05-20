import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Panel } from "azure-devops-ui/Panel";

import { IViewBugPanelState } from './ViewBugPanel.State';
import { IViewBugPanelProperties } from './ViewBugPanel.Props';
import { TaskAgentUpdateReasonType } from "TFS/DistributedTask/Contracts";
import { ObservableValue } from "azure-devops-ui/Core/Observable";

import { FormItem } from "azure-devops-ui/FormItem";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";

import restContractDefinitions = require('TFS/WorkItemTracking/Contracts');

const idObservable = new ObservableValue<string>("");
const titleObservable = new ObservableValue<string>("");
const stateObservable = new ObservableValue<string>("");
const reasonObservable = new ObservableValue<string>("");

export class ViewBugPanel extends React.Component<IViewBugPanelProperties, IViewBugPanelState> {
    constructor(props: IViewBugPanelProperties) {
        super(props);
        this.state = { 
            expanded: false,
            resolveButtonDisabled: false,
            rejectButtonDisabled: false
        };
    }
    
    


    public render(): JSX.Element {
        return (
            <div>
                {this.state.expanded && (
                    <Panel
                    onDismiss={() => this.setState({ expanded: false })}
                    titleProps={{ text: "Resolve/Reject Bug" }}
                    description={
                        "To resolve a bug or issue, please click Resolve button. To resolve a bug or issue, please click Reject button."
                    }
                    footerButtonProps={[
                        { text: "Resolve", primary: true, onClick: () => this.ResolveBug(), disabled: this.state.resolveButtonDisabled },
                        { text: "Reject", danger: true, onClick: () => this.RejectBug(), disabled: this.state.rejectButtonDisabled }
                    ]}
                    >
                        <div style={{ height: "1200px" }}>
                            <FormItem label="Bug Id:">
                                <TextField
                                value={idObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label="Title:">
                                <TextField
                                value={titleObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label="State:">
                                <TextField
                                value={stateObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label="Reason:">
                                <TextField
                                value={reasonObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                        </div>
                    </Panel>
                    )}
            </div>
        );
    }

    private ResolveBug() {

    }

    private RejectBug() {

    }

    public showPanel(witId: number) {
        this.setState({expanded: true})
        this.LoadWit(witId);
    }

    private LoadWit(witId: number) {
        VSS.require(["TFS/WorkItemTracking/RestClient"], function (witRestClient:any) {
            var witClient = witRestClient.getClient();
            var wit: restContractDefinitions.WorkItem = witClient.getWorkItem(witId).then(
                function(wit: restContractDefinitions.WorkItem) {
                    console.log("Selected: " + wit.id + " " + wit.fields["System.Title"]);
                    idObservable.value = wit.id.toString();
                    titleObservable.value = wit.fields["System.Title"];
                    stateObservable.value = wit.fields["System.State"];
                    reasonObservable.value = wit.fields["System.Reason"];
            });
        });
    }
}