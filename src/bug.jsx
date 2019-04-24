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
    render() {
        return (
            <Page className="sample-hub flex-grow">
            <Header title="Sample Hub"/>
            </Page>
        );
    }
}

ReactDOM.render(
    React.createElement(SimpleBugFormHubContent, { name : 'Piotrsko' }),
    document.getElementById('report-bug-root')
    );
