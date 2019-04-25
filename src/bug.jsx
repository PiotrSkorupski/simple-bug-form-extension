import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IHostPageLayoutService } from "azure-devops-extension-api";
import { Hello } from "./components/hello";

//import DevOps React UI components
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import {AllBugs} from "./components/AllBugs";
import {MyOpenBugs} from "./components/MyOpenBugs";
import {Button} from "azure-devops-ui/Button";
import {Panel} from "azure-devops-ui/Panel";

class SimpleBugFormHubContent extends React.Component {

    constructor(props) {
        super(props);
        this.onSelectedTabChanged = this.onSelectedTabChanged.bind(this);
        this.state = {selectedTabId: "my-open-bugs"};
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

    onSelectedTabChanged(newTabId) {
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

    async onPanelClick() {
        const panelService = await SDK.getService(CommonServiceIds.IHostPageLayoutService);
        panelService.openPanel(SDK.getExtensionContext().id + ".panel-content", {
            title: "My Panel",
            description: "Description of my panel",
            configuration: {
                message: "Show header description?",
                initialValue: !!this.state.headerDescription
            },
            onClose: (result) => {
                if (result !== undefined) {
                    this.setState({ headerDescription: result ? "This is a header description" : undefined });
                }
            }
        });
    }
}


ReactDOM.render(
    React.createElement(SimpleBugFormHubContent, { name : 'Report a Bug' }),
    document.getElementById('report-bug-root')
    );
