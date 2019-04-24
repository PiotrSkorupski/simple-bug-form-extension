import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Hello } from "./components/hello";

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
            <div>
                <Hello/>
                <Greetings/>
            </div>
        );
    }
}

ReactDOM.render(
    React.createElement(SimpleBugFormHubContent, { name : 'Piotrsko' }),
    document.getElementById('report-bug-root')
    );
