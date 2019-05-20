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
import { Toast } from "azure-devops-ui/Toast";
import { string } from "prop-types";
import { TaskAgentJobResultFilter } from "TFS/DistributedTask/Contracts";

interface IHubContentState {
    selectedTabId: string;
    fullScreenMode: boolean;
    headerDescription?: string;
    useLargeTitle?: boolean;
    useCompactPivots?: boolean;
    newBugPanelExpanded?: boolean;
    toastMessage: string;
    isToastVisible: boolean,
    isToastFadingOut: boolean
}

class SimpleBugFormHubContent extends React.Component<{}, IHubContentState> {
    private toastRef = React.createRef<Toast>();
    private newBugPanelComponent = React.createRef<NewBugPanel>();

    constructor(props: {}) {
        super(props);
        this.onSelectedTabChanged = this.onSelectedTabChanged.bind(this);
        this.showToast = this.showToast.bind(this);
        this.fadeToast = this.fadeToast.bind(this);

        this.state = {
                selectedTabId: "my-open-bugs", 
                fullScreenMode: false, 
                newBugPanelExpanded: false,
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
    }

    render() {
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
                <NewBugPanel ref={this.newBugPanelComponent} currentProjectName="P1" showToast={this.showToast} fadeToast={this.fadeToast}></NewBugPanel>
                {this.state.isToastVisible && (
                <Toast
                        ref={this.toastRef}
                        message={this.state.toastMessage}
                />
                )}
            </Page>
        );
    }

    onBugCreated() {
        console.log("SimpleBugFormHubContent onBugCreated()");
        this.showToast();
    }

    showToast = () => {
        console.log("SimpleBugFormHubContent showToast()");
        console.log("Toast isToastVisible: " + this.state.isToastVisible + " toastRef.current: " + this.toastRef.current);
        this.setState({toastMessage: "Submitting bug"})
        
        if (this.state.isToastFadingOut) {
            console.log("Toast state fading out");
            return;
        }

        if (this.state.isToastVisible && this.toastRef.current) {
            console.log("Toast state visible reference current");
            this.setState({ isToastFadingOut: true });
            this.toastRef.current.fadeOut().promise.then(() => {
                this.setState({ isToastVisible: false, isToastFadingOut: false });
            });
        } else {
            console.log("Toast state not visible");
            this.setState({ isToastVisible: true }, this.fadeToast);
        }
    }

    fadeToast = () => {
        console.log("SimpleBugFormHubContent fadeToast()");
        console.log("Toast isToastVisible: " + this.state.isToastVisible + " toastRef.current: " + this.toastRef.current);

        this.setState({toastMessage: "Bug submitted sucessfully"})

        if (this.state.isToastFadingOut) {
            console.log("Toast state fading out");
            return;
        }

        setTimeout(function(){ console.log("Time passed") }, 3000);

        if (this.state.isToastVisible && this.toastRef.current) {
            console.log("Toast state visible reference current");
            this.setState({ isToastFadingOut: true });
            this.toastRef.current.fadeOut().promise.then(() => {
                this.setState({ isToastVisible: false, isToastFadingOut: false });
            });
        }
    }

    getPageContent() {
        const { selectedTabId } = this.state;
        
        if (selectedTabId === "my-open-bugs") {
            console.count("getPageContent() " + selectedTabId);
            return <BugList mode={"my-open-bugs"}/>;
        }
        if (selectedTabId === "my-all-bugs") {
            console.count("getPageContent() " + selectedTabId);
            return <BugList mode={"my-all-bugs"}/>;
        }
        

    }

    onSelectedTabChanged(newTabId: string) {
        let currentComponent = this;
        //var bugList = React.createRef<BugList>();

        console.log('Tab changed to ' + newTabId);
        currentComponent.setState({
            selectedTabId: newTabId
        });

        // if (bugList.current) {
        //     console.log('Setting BugList state to: ' + newTabId);
        //     bugList.current.setState({mode: "my-all-bugs"});
        // }
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
