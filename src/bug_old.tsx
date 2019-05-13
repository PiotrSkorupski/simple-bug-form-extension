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
        this.state = {selectedTabId: "my-open-bugs", fullScreenMode: false, newBugPanelExpanded: false};

        super(props);
    }

    public componentDidMount() {
        console.log('Component indeed did mount, testing 1');
        // SDK.init();
        //this.initializeFullScreenState();
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
                <NewBugPanel ref={this.newBugPanelComponent}></NewBugPanel>
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

    // private async onPanelClick(): Promise<void> {
    //     console.log('Submit a bug clicked: ' + SDK.getExtensionContext().id + ".panel-content");

    //     const sdkHost = await SDK.getHost();
    //     const sdkUser = await SDK.getUser();
        
    //     console.log('SDK Init. Collection: ' + sdkHost.name + ' Type: ' + sdkHost.type + ' ID: ' + sdkHost.id + ' User: ' + sdkUser.displayName);

    //     const panelService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);

    //     console.log(panelService);
    //     panelService.openPanel<boolean | undefined>(SDK.getExtensionContext().id + ".panel-content", {
    //         title: "My Panel",
    //         description: "Description of my panel",
    //         configuration: {
    //             message: "Show header description?",
    //             initialValue: !!this.state.headerDescription
    //         },
    //         onClose: (result) => {
    //             if (result !== undefined) {
    //                 this.setState({ headerDescription: result ? "This is a header description" : undefined });
    //             }
    //         }
    //     });
    // }

    private async onPanelClick(): Promise<void> {
        // console.log('Submit a bug clicked: ' + SDK.getExtensionContext().id + ".panel-content");

        // const sdkHost = await SDK.getHost();
        // const sdkUser = await SDK.getUser();
        
        // console.log('SDK Init. Collection: ' + sdkHost.name + ' Type: ' + sdkHost.type + ' ID: ' + sdkHost.id + ' User: ' + sdkUser.displayName);
        const panel = this.newBugPanelComponent.current;
        if (panel) {
            panel.showPanel();
        }
    }

    // private async initializeFullScreenState() {
    //     const layoutService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
    //     console.log(layoutService);
    //     const fullScreenMode = await layoutService.getFullScreenMode();
    //     if (fullScreenMode !== this.state.fullScreenMode) {
    //         this.setState({ fullScreenMode });
    //     }
    // }

    private async onToggleFullScreenMode(): Promise<void> {
        const fullScreenMode = !this.state.fullScreenMode;
        this.setState({ fullScreenMode });

        // const layoutService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
        // layoutService.setFullScreenMode(fullScreenMode);
    }
}

ReactDOM.render(
    React.createElement(SimpleBugFormHubContent),
    document.getElementById('report-bug-root')
    );
