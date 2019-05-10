import * as React from 'react';
import { Table, TableRow, TableCell} from "azure-devops-ui/Table";
import { IMyOpenBugsState } from './MyOpenBugs.Props';

export class MyOpenBugs extends React.Component<{}, IMyOpenBugsState> {
    render(): JSX.Element{
        return (<div>My bugs here</div>);
    };
}