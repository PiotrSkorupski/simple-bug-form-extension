import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Hello } from "./components/hello";

//import DevOps React UI components
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";

class Greetings extends React.Component
{
    render()
    {
        //return React.createElement('h1', null, 'React, ' + this.props.name + '!');
        return <h1>H1 with JSX</h1>;
    }
}

class SimpleBugFormHubContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {selectedTabId: "my-open-bugs"};
    }

    render() {
        return (
            <Page className="flex-grow">
            <Header title="Report a bug" titleSize={TitleSize.Large}/>
                <TabBar tabSize={TabSize.Tall} selectedTabId={this.state.selectedTabId}>
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
            return "My open bugs content";
        if (selectedTabId === "my-all-bugs")
            return "All my bugs content";
    }
}


ReactDOM.render(
    React.createElement(SimpleBugFormHubContent, { name : 'Report a Bug' }),
    document.getElementById('report-bug-root')
    );
