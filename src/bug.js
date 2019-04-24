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
