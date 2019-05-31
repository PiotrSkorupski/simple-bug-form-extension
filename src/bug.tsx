import * as React from "react";
import * as ReactDOM from 'react-dom';


//import DevOps React UI components
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import { BugList } from "./components/BugList";
import {Button} from "azure-devops-ui/Button";
import {Panel} from "azure-devops-ui/Panel";
import { NewBugPanel } from "./components/NewBugPanel"
import { ViewBugPanel } from "./components/ViewBugPanel"
import { Toast } from "azure-devops-ui/Toast";
import { string } from "prop-types";
import { TaskAgentJobResultFilter, TaskAgentUpdateReasonType } from "TFS/DistributedTask/Contracts";
import { Observer } from "azure-devops-ui/Observer";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { CornerDialog } from "azure-devops-ui/Dialog";
import { Dialog } from "azure-devops-ui/Dialog";

import "./SimpleBugForm.css"

import { FormItem } from "azure-devops-ui/FormItem";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";


interface IHubContentState {
    selectedTabId: string;
    fullScreenMode: boolean;
    headerDescription?: string;
    useLargeTitle?: boolean;
    useCompactPivots?: boolean;
    newBugPanelExpanded?: boolean;
    viewBugPanelExpanded?: boolean;
    toastMessage: string;
    isToastVisible: boolean,
    isToastFadingOut: boolean,
    forceRefreshBugList: boolean
}

class SimpleBugFormHubContent extends React.Component<{}, IHubContentState> {
    private toastRef = React.createRef<Toast>();
    private newBugPanelComponent = React.createRef<NewBugPanel>();
    private viewBugPanelRef = React.createRef<ViewBugPanel>();
    private bugListRef = React.createRef<BugList>();
    private isDialogOpen = new ObservableValue<boolean>(false);
    private dialogBody: JSX.Element = this.getDialogBody();
    private dialogTitle: string = "";

    constructor(props: {}) {
        super(props);
        this.onSelectedTabChanged = this.onSelectedTabChanged.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.showViewBugPanel = this.showViewBugPanel.bind(this);
        this.hideViewBugPanel = this.hideViewBugPanel.bind(this);
        this.forceRefreshBugList = this.forceRefreshBugList.bind(this);

        this.state = {
                selectedTabId: "my-open-bugs", 
                fullScreenMode: false, 
                newBugPanelExpanded: false,
                viewBugPanelExpanded: false,
                toastMessage: "Bug submitted sucessfully",
                isToastVisible: false,
                isToastFadingOut: false,
                forceRefreshBugList: false
            };
        
        super(props);
    }

    forceRefreshBugList =() => {
        console.log("forceRefreshBugList() on parent");
        console.log("forceRefreshBugList() state before " + this.state.forceRefreshBugList);
        this.setState({forceRefreshBugList:!this.state.forceRefreshBugList}, () => {console.log("forceRefreshBugList() state after " + this.state.forceRefreshBugList);});
        
    }

    public componentDidMount() {
        console.log('Component indeed did mount, testing 2');

        console.log("Initializing VSS");
        VSS.init({
            explicitNotifyLoaded: true,
            usePlatformScripts: true
        });

        console.log("VSS loaded");
        console.log("VSS sdk ready");
        VSS.ready(function() {
            console.log("VSS current user context: " + VSS.getWebContext().user.name);
            console.log("VSS current user context: " + VSS.getWebContext().project.name);

            VSS.require(["TFS/WorkItemTracking/RestClient"], function (witRestClient:any) {
                var witClient = witRestClient.getClient();
                var wits: any = witClient.getWorkItem(76).then(
                    function(wits:any) {
                        console.log(JSON.stringify(wits));
                });
            });

        });

        VSS.notifyLoadSucceeded();

        this.hideViewBugPanel();
    }

    render() {
        const onDismiss = () => {
            this.isDialogOpen.value = false;
        };
        return (
            <Page className="flex-grow">
            <Header title="Report a bug" titleSize={TitleSize.Large} commandBarItems={this.getCommandBarItems()}/>
                <TabBar tabSize={TabSize.Tall} 
                        selectedTabId={this.state.selectedTabId} 
                        onSelectedTabChanged={this.onSelectedTabChanged}
                >
                    <Tab name="Bugs to retest and close" id="my-open-bugs" />
                    <Tab name="All bugs reported by me" id="my-all-bugs" />
                </TabBar>
                <div className="page-content">
                    { this.getPageContent() }
                </div>
                <NewBugPanel 
                    ref={this.newBugPanelComponent} 
                    currentProjectName="P1" 
                    showDialog={this.showDialog}
                    forceRefreshBugList={this.forceRefreshBugList}
                >
                </NewBugPanel>
                <ViewBugPanel 
                    ref={this.viewBugPanelRef} 
                    currentProjectName="P1" 
                    showDialog={this.showDialog}
                    forceRefreshBugList={this.forceRefreshBugList}
                >
                </ViewBugPanel>
                <Observer isDialogOpen={this.isDialogOpen}>
                    {(props: { isDialogOpen: boolean }) => {
                        return props.isDialogOpen ? (
                            <CornerDialog
                                onDismiss={onDismiss}
                                footerButtonProps={[
                                    {
                                        onClick: onDismiss,
                                        text: "Dismiss",
                                        primary: true
                                    }
                                ]}
                                titleProps={{
                                    text: this.dialogTitle
                                }}
                            >
                                <div className="flex-column">
                                    <span className="body-m">
                                        {this.dialogBody}
                                    </span>
                                </div>
                            </CornerDialog>
                        ) : null;
                    }}
                </Observer>
            </Page>
        );
    }

    onBugCreated() {
        console.log("SimpleBugFormHubContent onBugCreated()");
    }

    showDialog(title?:string, message?: string) {
                
        this.dialogBody = this.getDialogBody(message);

        if (title)
            this.dialogTitle = title;
        
        this.isDialogOpen.value = true;
    }

    getDialogBody(message?: string): JSX.Element {
        console.log("getRejectDialogBody()");
        if (message) 
            return <div>{message}</div>;
        else
            return <div></div>;
    }

    showViewBugPanel = (witId: number) => {
        console.log("showViewBugPanel(). WitID: " + witId);
        this.setState({viewBugPanelExpanded: true});

        const viewBugPanel = this.viewBugPanelRef.current;
        if (viewBugPanel) {
            viewBugPanel.showPanel(witId);
        }
    }

    hideViewBugPanel = () => {
        console.log("hideViewBugPanel()");
        if(this.viewBugPanelRef.current) {
            this.viewBugPanelRef.current.setState({expanded: false});
        }
    }

    getPageContent() {
        const { selectedTabId } = this.state;
        
        if (selectedTabId === "my-open-bugs") {
            console.count("getPageContent() " + selectedTabId);
            return <BugList 
                mode={"my-open-bugs"}
                showViewBugPanel={this.showViewBugPanel}
                hideViewBugPanel={this.hideViewBugPanel}
                forceRefreshBugList={this.state.forceRefreshBugList}
            />;
        }
        if (selectedTabId === "my-all-bugs") {
            console.count("getPageContent() " + selectedTabId);
            return <BugList 
                mode={"my-all-bugs"}
                showViewBugPanel={this.showViewBugPanel}
                hideViewBugPanel={this.hideViewBugPanel}
                forceRefreshBugList={this.state.forceRefreshBugList}
            />;
        }
    }

    onSelectedTabChanged(newTabId: string) {
        let currentComponent = this;
        //var bugList = React.createRef<BugList>();

        console.log('Tab changed to ' + newTabId);
        currentComponent.setState({
            selectedTabId: newTabId
        });
    }

    getCommandBarItems() {
        return ([
            {
                id: "panel",
                text: "Submit a bug",
                onActivate: () => { this.onPanelClick() },
                iconProps: {
                    iconName: 'Add'
                },
                isPrimary: true,
                tooltipProps: {
                    text: "Open a panel with custom extension content"
                }
            }
        ]);
    }

    private async onPanelClick(): Promise<void> {
        const panel = this.newBugPanelComponent.current;
        if (panel) {
            panel.showPanel();
        }
    }
}

ReactDOM.render(
    React.createElement(SimpleBugFormHubContent),
    document.getElementById('report-bug-root')
    );
