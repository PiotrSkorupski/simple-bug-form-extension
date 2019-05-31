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

import { LocalizationStrings } from "../Strings"

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
            rejectButtonDisabled: false,
            dialogRejectButtonDisabled: true,
            isRejectReasonError: true,
            rejectReasonError: LocalizationStrings.rejectReasonErrorMessage
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
                    onDismiss={() => {
                        this.setState({ expanded: false });
                        this.clearViewForm();
                    }}
                    titleProps={{ text: LocalizationStrings.viewBugFormTitle }}
                    description={
                        LocalizationStrings.viewBugFormDescription
                    }
                    footerButtonProps={[
                        { text: LocalizationStrings.viewBugFormCloseButtonText, primary: true, onClick: () => this.ResolveBug(), disabled: this.state.resolveButtonDisabled },
                        { text: LocalizationStrings.viewBugFormRejectButtonText, onClick: () => this.RejectBug(), disabled: this.state.rejectButtonDisabled },
                        { text: LocalizationStrings.viewBugFormCancelButtonText, subtle: true, onClick: () => {
                            this.setState({ expanded: false });
                            this.props.forceRefreshBugList();
                        }, 
                        disabled: false }
                    ]}
                    >
                        <div style={{ height: "1200px" }}>
                            <FormItem label={LocalizationStrings.bugIdFieldLabel}>
                                <TextField
                                value={idObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label={LocalizationStrings.bugTitleFieldLabel}>
                                <TextField
                                value={titleObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label={LocalizationStrings.bugDescriptionFieldLabel}>
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
                            <FormItem label={LocalizationStrings.bugReproFieldLabel}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugReproObservable}
                                    multiline
                                    rows={4}
                                    width={TextFieldWidth.standard}
                                    disabled = {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label={LocalizationStrings.bugStateFiledLabel}>
                                <TextField
                                value={stateObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label={LocalizationStrings.bugReasonFiledLabel}>
                                <TextField
                                value={reasonObservable}
                                width={TextFieldWidth.standard}
                                disabled= {true}
                                />
                            </FormItem>
                            <br/>
                            <FormItem label={LocalizationStrings.bugCommentFieldLabel}>
                                <TextField
                                    ariaLabel="Aria label"
                                    value={bugCommentsObservable}
                                    multiline
                                    rows={8}
                                    width={TextFieldWidth.standard}
                                    placeholder=""
                                    disabled = {true}
                                    readOnly = {true}
                                />
                            </FormItem>
                            <br/>
                            <Link href={bugEditLink} subtle={true} target="_blank">{LocalizationStrings.bugDetailsLinkLabel}</Link><br/>
                            <Link href={bugEditLink} subtle={true} target="_blank">{LocalizationStrings.bugTestCaseLinkLabel}</Link>
                            <br/>
                            <br/>
                            <FormItem label={LocalizationStrings.bugCreatedDateFieldLabel}>{bugCreatedDateObservable.value}</FormItem><br/>
                            <FormItem label={LocalizationStrings.bugCreatedByFieldLabel}>{bugCreatedByObservable.value}</FormItem><br/>
                            <FormItem label={LocalizationStrings.bugModifiedDateFieldLabel}>{bugModifiedDateObservable.value}</FormItem><br/>
                            <FormItem label={LocalizationStrings.bugModifiedByFieldLabel}>{bugModifiedByObservable.value}</FormItem><br/>
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
                                        text: LocalizationStrings.rejectDialogRejectButtonText,
                                        primary: true,
                                        disabled: this.state.dialogRejectButtonDisabled
                                    },
                                    {
                                        onClick: onRejectDialogDismiss,
                                        text: LocalizationStrings.rejectDialogCancelButtonText,
                                        primary: false,
                                    }
                                ]}
                                titleProps={{
                                    text: this.rejectDialogTitle
                                }}
                            >
                                <div className="flex-column">
                                    <FormItem label={LocalizationStrings.rejectReasonDialogFieldLablel} message={this.state.rejectReasonError} error={this.state.isRejectReasonError}>
                                    <TextField
                                        ariaLabel="Aria label"
                                        value={bugRejectReasonObservable}
                                        onChange={(e, newValue) => 
                                            {
                                                bugRejectReasonObservable.value = newValue;
                                                if (this.isNotEmptyOrNull(newValue)) {
                                                    // this.setState ({rejectButtonDisabled: false},
                                                    //     ()=>{this.updateFormValid()}
                                                    // );
                                                    this.setState ({dialogRejectButtonDisabled: false, isRejectReasonError: false, rejectReasonError: ""});
                                                } else {
                                                    this.setState ({dialogRejectButtonDisabled: true, isRejectReasonError: true, rejectReasonError: LocalizationStrings.rejectReasonErrorMessage});
                                                }
                                            }
                                    }      
                                        multiline
                                        rows={6}
                                        width={TextFieldWidth.standard}
                                        placeholder={LocalizationStrings.rejectReasonDialogFieldPlaceholder}
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

    clearViewForm() {
        titleObservable.value = "";
        stateObservable.value = "";
        reasonObservable.value = "";
        bugDescriptionObservable.value = "";
        bugReproObservable.value = "";
        bugWitLinkObservable.value = "";
        bugCreatedByObservable.value = "";
        bugCreatedDateObservable.value = "";
        bugModifiedDateObservable.value = "";
        bugModifiedByObservable.value = "";
        bugCommentsObservable.value = "";
    }

    private isNotEmptyOrNull(newValue: string): boolean {
        console.log("isNotEmptyOrNull. Value: " + newValue + " Value length: " + newValue.length);
        if (newValue && 0 < newValue.length && newValue.trim()) {
            console.log("isNotEmptyOrNull true");
            return true;
        } else {
            console.log("isNotEmptyOrNull false");
            return false;
        }
    }

    onRejectConfirm() {
        var currentDateTimeString = format(new Date(), LocalizationStrings.dateTimeFormatString);
        
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

                    this.props.showDialog(LocalizationStrings.rejectConfirmDialogTitle, LocalizationStrings.rejectConfirmDialogMessage);
                    this.props.forceRefreshBugList();
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
                    this.props.showDialog(LocalizationStrings.closeConfirmDialogTitle, LocalizationStrings.closeConfirmDialogMessage);
                    this.props.forceRefreshBugList();
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
                    let parsedCreatedDateString:string = format(createdDate, LocalizationStrings.dateTimeFormatString);
                    //console.log("Parsed created date: " + parsedCreatedDateString);
                    bugCreatedDateObservable.value = parsedCreatedDateString;

                    let changedDate: Date = new Date(wit.fields["System.CreatedDate"]);
                    let parsedChangedDateString:string = format(changedDate, LocalizationStrings.dateTimeFormatString);
                    bugModifiedDateObservable.value = parsedChangedDateString;
                    
                    bugModifiedByObservable.value = wit.fields["System.ChangedBy"];
                    bugCommentsObservable.value = wit.fields["Microsoft.VSTS.CMMI.Comments"];
                    
                    // if(wit.fields["Microsoft.VSTS.CMMI.Comments"] && wit.fields["Microsoft.VSTS.CMMI.Comments"].length <=0)
                    //     bugCommentsObservable.value = "";
                    // else
                    //     bugCommentsObservable.value = wit.fields["Microsoft.VSTS.CMMI.Comments"];

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