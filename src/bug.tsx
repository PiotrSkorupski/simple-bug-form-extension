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
import "./SimpleBugForm.css"


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
    isToastFadingOut: boolean
}

class SimpleBugFormHubContent extends React.Component<{}, IHubContentState> {
    private toastRef = React.createRef<Toast>();
    private newBugPanelComponent = React.createRef<NewBugPanel>();
    private viewBugPanelRef = React.createRef<ViewBugPanel>();
    private isDialogOpen = new ObservableValue<boolean>(false);
    private dialogBody: string = "";
    private dialogTitle: string = "";

    constructor(props: {}) {
        super(props);
        this.onSelectedTabChanged = this.onSelectedTabChanged.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.showViewBugPanel = this.showViewBugPanel.bind(this);
        this.hideViewBugPanel = this.hideViewBugPanel.bind(this);


        this.state = {
                selectedTabId: "my-open-bugs", 
                fullScreenMode: false, 
                newBugPanelExpanded: false,
                viewBugPanelExpanded: false,
                toastMessage: "Bug submitted sucessfully",
                isToastVisible: false,
                isToastFadingOut: false    
            };
        
        super(props);
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
                var wits: any = witClient.getWorkItem(4).then(
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
                    <Tab name="My Open Bugs" id="my-open-bugs" />
                    <Tab name="All My Bugs" id="my-all-bugs" />
                </TabBar>
                <div className="page-content">
                    { this.getPageContent() }
                </div>
                <NewBugPanel 
                    ref={this.newBugPanelComponent} 
                    currentProjectName="P1" 
                    showDialog={this.showDialog}
                >
                </NewBugPanel>
                <ViewBugPanel 
                    ref={this.viewBugPanelRef} 
                    currentProjectName="P1" 
                    showDialog={this.showDialog}
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
        if (message)
            this.dialogBody = message;
        if (title)
            this.dialogTitle = title;
        
        this.isDialogOpen.value = true;
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
            />;
        }
        if (selectedTabId === "my-all-bugs") {
            console.count("getPageContent() " + selectedTabId);
            return <BugList 
                mode={"my-all-bugs"}
                showViewBugPanel={this.showViewBugPanel}
                hideViewBugPanel={this.hideViewBugPanel}
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
