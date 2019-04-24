import React from 'react';
import ReactDOM from 'react-dom';
//import Hello from './components/Hello';

//ReactDOM.render(<Hello/>, document.getElementById('report-bug-root'));

window.onload = function()
{
    class Greetings extends React.Component
    {
        render()
        {
            return React.createElement('h1', null, 'React, ' + this.props.name + '!');
        }
    }
    ReactDOM.render(
        React.createElement(Greetings, { name : 'Piotrsko' }),
        document.getElementById('report-bug-root')
    );
};