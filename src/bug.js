class Greetings extends React.Component
{
    render()
    {
        return React.createElement('h1', null, 'React, ' + this.props.name + '!');
        //return <h1>H1 with JSX</h1>;
    }
}

ReactDOM.render(
    React.createElement(Greetings, { name : 'Piotrsko' }),
    document.getElementById('report-bug-root')
    );
