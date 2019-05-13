import * as React from "react";
import * as ReactDOM from 'react-dom';
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IHostPageLayoutService } from "azure-devops-extension-api";


//import DevOps React UI components
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import {AllBugs} from "./components/AllBugs";
import {MyOpenBugs} from "./components/MyOpenBugs";
import {Button} from "azure-devops-ui/Button";
import {Panel} from "azure-devops-ui/Panel";
import { NewBugPanel } from "./components/NewBugPanel"

interface IHubContentState {
    selectedTabId: string;
    fullScreenMode: boolean;
    headerDescription?: string;
    useLargeTitle?: boolean;
    useCompactPivots?: boolean;
    newBugPanelExpanded?: boolean;
}

class SimpleBugFormHubContent extends React.Component<{}, IHubContentState> {

    constructor(props: {}) {
        super(props);
        this.onSelectedTabChanged = this.onSelectedTabChanged.bind(this);
        this.state = {
                selectedTabId: "my-open-bugs", 
                fullScreenMode: false, 
                newBugPanelExpanded: false
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

            //currentProjectName = VSS.getWebContext().project.name;
            

            VSS.require(["TFS/WorkItemTracking/RestClient"], function (witRestClient:any) {
                var witClient = witRestClient.getClient();
                var wits: any = witClient.getWorkItem(4).then(
                    function(wits:any) {
                        console.log(JSON.stringify(wits));
                });
            });

        });

        VSS.notifyLoadSucceeded();
        
        //SDK.init();
    }

    private newBugPanelComponent = React.createRef<NewBugPanel>();

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
                <NewBugPanel ref={this.newBugPanelComponent} currentProjectName="P1"></NewBugPanel>
            </Page>
        );
    }

    getPageContent() {
        const { selectedTabId } = this.state;
        
        if (selectedTabId === "my-open-bugs")
            return <MyOpenBugs/>;
        if (selectedTabId === "my-all-bugs")
            return <AllBugs/>;
        

    }

    onSelectedTabChanged(newTabId: string) {
        let currentComponent = this;

        console.log('Tab changed to ' + newTabId)
        currentComponent.setState({
            selectedTabId: newTabId
        })
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
