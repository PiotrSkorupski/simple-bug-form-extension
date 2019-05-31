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
import restClientDefinitions = require('TFS/WorkItemTracking/RestClient');
import { Link } from "azure-devops-ui/Link";

import { CornerDialog } from "azure-devops-ui/Dialog";
import { Dialog } from "azure-devops-ui/Dialog";
import { Observer } from "azure-devops-ui/Observer";

import { format, formatDistance, formatRelative, subDays, parse } from 'date-fns'

const idObservable = new ObservableValue<string>("");
const titleObservable = new ObservableValue<string>("");
const stateObservable = new ObservableValue<string>("");
const reasonObservable = new ObservableValue<string>("");
const bugDescriptionObservable = new ObservableValue<string>("");
const bugReproObservable = new ObservableValue<string>("");
const bugWitLinkObservable = new ObservableValue<string>("");
const bugCreatedByObservable = new ObservableValue<string>("");
const bugCreatedDateObservable = new ObservableValue<string>("");
const bugModifiedByObservable = new ObservableValue<string>("");
const bugModifiedDateObservable = new ObservableValue<string>("");
const bugCommentsObservable = new ObservableValue<string>("");
const bugRejectReasonObservable = new ObservableValue<string>("");


interface IBugWitPatch {
    op: string;
    path: string;
    value: string;
    from: string | null;
}

interface IBugWitPatchArray extends Array<IBugWitPatch>{}

export class ViewBugPanel extends React.Component<IViewBugPanelProperties, IViewBugPanelState> {
    constructor(props: IViewBugPanelProperties) {
        super(props);
        this.state = { 
            expanded: false,
            resolveButtonDisabled: false,
            rejectButtonDisabled: false
        };
    }

    private isRejectDialogOpen = new ObservableValue<boolean>(false);
    private rejectDialogTitle: string = "Reject dialog title";
    private rejectDialogBody: string = "Reject dialog body";

    public render(): JSX.Element {
        var bugLink = bugWitLinkObservable.value;
        var bugEditLink = bugLink.substr(0, bugLink.lastIndexOf("/")) + "/edit" + bugLink.substr(bugLink.lastIndexOf("/"));
        bugEditLink = bugEditLink.replace("_apis/wit/workItems", "_workitems");
        console.log("Bug edit link: " + bugEditLink);
        const onRejectDialogDismiss = () => {
            this.isRejectDialogOpen.value = false;
        };
        const onRejectDialogConfirm = () => {
            this.isRejectDialogOpen.value = false;
            this.onRejectConfirm();
        };
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
                        { text: "Close", primary: true, onClick: () => this.ResolveBug(), disabled: this.state.resolveButtonDisabled },
                        { text: "Reject", onClick: () => this.RejectBug(), disabled: this.state.rejectButtonDisabled },
                        { text: "Cancel", subtle: true, onClick: () => this.setState({ expanded: false }), disabled: this.state.rejectButtonDisabled }
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
                            <FormItem label={"Bug Description"}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugDescriptionObservable}
                                    multiline
                                    rows={4}
                                    width={TextFieldWidth.standard}
                                    placeholder="Bug description"
                                    disabled = {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label={"Bug Description"}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugReproObservable}
                                    multiline
                                    rows={4}
                                    width={TextFieldWidth.standard}
                                    placeholder="Bug repro"
                                    disabled = {true}
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
                            <FormItem label={"Comments"}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugCommentsObservable}
                                    multiline
                                    rows={8}
                                    width={TextFieldWidth.standard}
                                    placeholder="Comments"
                                    disabled = {true}
                                />
                            </FormItem>
                            <br/>
                            <Link href={bugEditLink} subtle={true} target="_blank">Clik here for bug details</Link><br/>
                            <Link href={bugEditLink} subtle={true} target="_blank">Clik here for associated test case</Link>
                            <br/>
                            <br/>
                            <FormItem label="Created date: ">{bugCreatedDateObservable.value}</FormItem><br/>
                            <FormItem label="Created by: ">{bugCreatedByObservable.value}</FormItem><br/>
                            <FormItem label="Last changed date: ">{bugModifiedDateObservable.value}</FormItem><br/>
                            <FormItem label="Last changed by: ">{bugModifiedByObservable.value}</FormItem><br/>
                        </div>
                    </Panel>
                    )}
                    <Observer isRejectDialogOpen={this.isRejectDialogOpen}>
                    {(props: { isRejectDialogOpen: boolean }) => {
                        return props.isRejectDialogOpen ? (
                            <Dialog
                                onDismiss={onRejectDialogDismiss}
                                footerButtonProps={[
                                    {
                                        onClick: onRejectDialogConfirm,
                                        text: "Reject",
                                        primary: true,
                                    },
                                    {
                                        onClick: onRejectDialogDismiss,
                                        text: "Cancel",
                                        primary: false,
                                    }
                                ]}
                                titleProps={{
                                    text: this.rejectDialogTitle
                                }}
                            >
                                <div className="flex-column">
                                    Please enter reject reason
                                    <FormItem label={"Reject reason"}>
                                    <TextField
                                        ariaLabel="Aria label"
                                        value={bugRejectReasonObservable}
                                        onChange={(e, newValue) => 
                                            {
                                                bugRejectReasonObservable.value = newValue
                                            }}
                                        multiline
                                        rows={6}
                                        width={TextFieldWidth.standard}
                                        placeholder="Reject reason"
                                        disabled = {false}
                                        readOnly = {false}
                                    />
                                    </FormItem>
                                </div>
                            </Dialog>
                        ) : null;
                    }}
                </Observer>
            </div>
        );
    }

    onRejectConfirm() {
        var currentDateTimeString = format(new Date(), "dd.MM.yyyy HH:mm:ss");
        
        var rejectReason = bugCommentsObservable.value + "\r\n" + currentDateTimeString + " Reject reason: " + bugRejectReasonObservable.value;
        
        var bugWitPatchArray: IBugWitPatchArray = [{
            op: "add",
            path: "/fields/System.State",
            from: null,
            value: "Active"
        },
        {
            op: "add",
            path: "/fields/System.Reason",
            from: null,
            value: "Not fixed"
        },
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.CMMI.Comments",
            from: null,
            value: rejectReason
        }];

        VSS.require(["TFS/WorkItemTracking/RestClient"], (witRestClient:any) => {
            var witClient = witRestClient.getClient();
            var sampleWitJsonPatch = JSON.stringify(bugWitPatchArray);
            var sampleWit = witClient.updateWorkItem(JSON.parse(sampleWitJsonPatch), idObservable.value).then(
                (sampleWit:any) => {
                    console.log("Bug rejected: " + sampleWit);

                    this.isRejectDialogOpen.value = false;
                    bugRejectReasonObservable.value = "";
                    this.setState({expanded: false});

                    this.props.showDialog("Report a bug", "Bug rejected");
                }
            );
        });

        
    }

    RejectBug() {
        console.log("showRejectDialog() parent, open: " + this.isRejectDialogOpen.value);
        this.isRejectDialogOpen.value = true;
        console.log("showRejectDialog() parent, open: " + this.isRejectDialogOpen.value);
    }

    clearRejectForm() {
        this.isRejectDialogOpen.value = false;
        bugRejectReasonObservable.value = "";
        this.setState({expanded: false});  
    }

    private ResolveBug() {

        var bugWitPatchArray: IBugWitPatchArray = [{
            op: "add",
            path: "/fields/System.State",
            from: null,
            value: "Closed"
        },
        {
            op: "add",
            path: "/fields/System.Reason",
            from: null,
            value: "Verified"
        }
    ];

        VSS.require(["TFS/WorkItemTracking/RestClient"], (witRestClient:any) => {
            var witClient = witRestClient.getClient();
            var sampleWitJsonPatch = JSON.stringify(bugWitPatchArray);
            var sampleWit = witClient.updateWorkItem(JSON.parse(sampleWitJsonPatch), idObservable.value).then(
                (sampleWit:any) => {
                    console.log("Bug closed: " + sampleWit);
                    this.props.showDialog("Report a bug", "Bug closed");
                }
            );
        });

        this.setState({expanded: false});  
    }

    public showPanel(witId: number) {
        this.setState({expanded: true})
        this.LoadWit(witId);
    }

    private LoadWit(witId: number) {
        VSS.require(["TFS/WorkItemTracking/RestClient"], (witRestClient:any) => {
            var witClient = witRestClient.getClient();
            var wit: restContractDefinitions.WorkItem = witClient.getWorkItem(witId).then(
                (wit: restContractDefinitions.WorkItem) => {
                    console.log(wit);
                    console.log("Selected: " + wit.id + " " + wit.fields["System.Title"]);
                    idObservable.value = wit.id.toString();
                    titleObservable.value = wit.fields["System.Title"];
                    stateObservable.value = wit.fields["System.State"];
                    reasonObservable.value = wit.fields["System.Reason"];
                    bugDescriptionObservable.value = wit.fields["Microsoft.VSTS.TCM.ReproSteps"];
                    bugReproObservable.value = wit.fields["Microsoft.VSTS.TCM.ReproSteps"];
                    bugWitLinkObservable.value = wit.url;
                    bugCreatedByObservable.value = wit.fields["System.CreatedBy"];

                    let createdDate: Date = new Date(wit.fields["System.CreatedDate"]);
                    let parsedCreatedDateString:string = format(createdDate, "dd.MM.yyyy HH:mm:ss");
                    //console.log("Parsed created date: " + parsedCreatedDateString);
                    bugCreatedDateObservable.value = parsedCreatedDateString;

                    let changedDate: Date = new Date(wit.fields["System.CreatedDate"]);
                    let parsedChangedDateString:string = format(changedDate, "dd.MM.yyyy HH:mm:ss");
                    bugModifiedDateObservable.value = parsedChangedDateString;
                    
                    bugModifiedByObservable.value = wit.fields["System.ChangedBy"];

                    bugCommentsObservable.value = wit.fields["Microsoft.VSTS.CMMI.Comments"];

                    this.setButtonsState();
            });
        });

        
    }

    private setButtonsState() {
        console.log("setButtonsState()");
        if (stateObservable.value==="Resolved") {
            console.log("setButtonsState() close / reject buttons active");
            this.setState({rejectButtonDisabled:false, resolveButtonDisabled: false});
        } else {
            console.log("setButtonsState() close / reject buttons inactive");
            this.setState({rejectButtonDisabled:true, resolveButtonDisabled: true});
        }
    }
}