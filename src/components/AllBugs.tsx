import * as React from 'react';
import { Table, TableRow, TableCell} from "azure-devops-ui/Table";
import { IAllBugsState } from "./AllBugs.Props";

export class AllBugs extends React.Component<{}, IAllBugsState> {
    render(): JSX.Element{
        return (<div>My bugs here</div>);
    };
}