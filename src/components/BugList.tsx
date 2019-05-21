import * as React from 'react';

import { ITableItem } from "./BugListTableData";
import { IBugListState } from "./BugList.State";
import { IBugListProps } from "./BugList.Props";

import restClientDefinitions = require('TFS/WorkItemTracking/RestClient');
import restContractDefinitions = require('TFS/WorkItemTracking/Contracts');
import vssServiceDefinitions = require('VSS/Service');

import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Icon, IIconProps } from "azure-devops-ui/Icon";

import { Card } from "azure-devops-ui/Card";
import {
    ColumnFill,
    ColumnSorting,
    renderSimpleCell,
    sortItems,
    SortOrder,
    Table,
    ITableColumn,
    ITableRow
} from "azure-devops-ui/Table";
import { IterationReason } from 'TFS/VersionControl/Contracts';
import { func } from 'prop-types';

export class BugList extends React.Component<IBugListProps, IBugListState> {
    private tableComponent = React.createRef<Table<ITableItem>>();
    constructor(props: IBugListProps) {
        super(props);
        var emptyTable = new ObservableArray<ITableItem>();
        this.state = { 
            tableContents: emptyTable,
            mode: this.props.mode
        };
    }

    render(): JSX.Element {
        return (
            <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
                <Table<ITableItem>
                    //behaviors={[sortingBehavior]}
                    columns={columns}
                    itemProvider={this.state.tableContents}
                    onSelect={(event, data) => this.onBugSelect(event, data)}
                />
            </Card>
        );
    };

    componentWillReceiveProps(props: IBugListProps) {
        console.log("BugList received properties, mode " + this.props.mode);
        this.setState({ mode:  this.props.mode });
        //this.GetMyOpenBugs();
    }

    componentDidUpdate(prevProps: IBugListProps){
        if (prevProps.mode !== this.props.mode) {
            this.GetMyOpenBugs();
        }
    }

    onBugSelect(event: React.SyntheticEvent<HTMLElement>, data: ITableRow<ITableItem>) {
        console.log("Selected row: " + data.index + " " + data.data.Id)
        this.props.showViewBugPanel(data.data.Id);
    }

    public componentDidMount() {
        console.log('MyOpenBugs did mount');
        this.GetMyOpenBugs();
    }

    private GetQuery() {
        if (this.props.mode == "my-open-bugs") {
            return {query: "SELECT [System.Id], [System.Title] FROM WorkItem WHERE [System.WorkItemType] = 'Bug' AND [System.State] NOT IN ('Closed','Completed','Resolved','Removed', 'Done')"};
        } else {
            return {query: "SELECT [System.Id], [System.Title] FROM WorkItem WHERE [System.WorkItemType] = 'Bug'"};
        }
    }

    private GetMyOpenBugs() {
        console.log('GetMyOpenBugs()');
        //var query = "SELECT [System.Id, System.State, System.Reason, System.Title, System.AssignedTo] FROM WorkItem WHERE [System.WorkItemType] = 'Bug' AND [System.State] NOT IN ('Closed','Completed','Resolved','Removed', 'Done')";
        var query = this.GetQuery();

        var fields = [
            "System.Title", 
            "System.State", 
            "System.Reason",
            "System.AssignedTo",
            "System.CreatedBy",
            "System.ChangedDate"
        ];

        VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (vssService:any, witRestApi:any) => {
            var projectId = VSS.getWebContext().project.id;
            console.log("GetMyOpenBugs current project id: " + projectId);

            console.log("Trying to get witClient");
            var witClient = vssService.getCollectionClient(witRestApi.WorkItemTrackingHttpClient);
            console.log("witClient obtained");

            witClient.queryByWiql(query, projectId).then(
                (result:any) => {
                    console.log("Get wit Ids: " + result);
                    console.log("Get wit Ids count: " + result.length);
                    var bugsToRetestIds = result.workItems.map(function(wi:any) { return wi.id });
                    // We now have the id's of all work items that are open
                    // notifyLoadSucceeded is called after the REST call is finished
                    witClient.getWorkItems(bugsToRetestIds, fields).then(
                        (bugs: restContractDefinitions.WorkItem[], columns:restContractDefinitions.WorkItemFieldReference[]) => {
                            // Access the work items and their field values
                            console.log("getWorkItems() count: " + bugs.length);
                            console.log(bugs);

                            this.UpdateBugsList(bugs);
                            
                            VSS.notifyLoadSucceeded();
                            
                        });
                    VSS.notifyLoadSucceeded();   
                });               
        });
    }

    private UpdateBugsList(bugs: restContractDefinitions.WorkItem[]) {
         let rawTableItems: ITableItem[] = [];

        bugs.forEach(function(value:restContractDefinitions.WorkItem) {
            console.log(value.id + " " + value.fields["System.Title"] + " " + value.fields["System.State"] + " " + value.fields["System.Reason"]);
            rawTableItems.push({
                Id:value.id, 
                Title: {iconProps: { iconName: 'Bug'}, text: value.fields["System.Title"]}, 
                State: value.fields["System.State"],
                Reason: value.fields["System.Reason"],
                CreatedBy: value.fields["System.CreatedBy"]["displayName"],
                DateModified: value.fields["System.ChangedDate"]
            });
        });

        var tableItems = new ObservableArray<ITableItem>(rawTableItems);

        this.setState({tableContents: tableItems})
    }
}

const columns: ITableColumn<ITableItem>[] = [
    {
        id: "Id",
        minWidth: 50,
        maxWidth: 50,
        name: "Id",
        onSize: onSize,
        renderCell: renderSimpleCell,
        sortProps: {
            ariaLabelAscending: "Sorted A to Z",
            ariaLabelDescending: "Sorted Z to A"
        },
        width: new ObservableValue(50)
    },
    {
        id: "Title",
        maxWidth: 300,
        name: "Title",
        onSize: onSize,
        renderCell: renderSimpleCell,
        sortProps: {
            ariaLabelAscending: "Sorted low to high",
            ariaLabelDescending: "Sorted high to low"
        },
        width: new ObservableValue(100)
    },
    { 
        id: "CreatedBy", 
        maxWidth: 300,
        name: "Created By", 
        onSize: onSize,
        renderCell: renderSimpleCell,
        sortProps: {
            ariaLabelAscending: "Sorted low to high",
            ariaLabelDescending: "Sorted high to low"
        },
        width: new ObservableValue(150)
    },
    {
        id: "State",
        maxWidth: 300,
        name: "State",
        onSize: onSize,
        renderCell: renderSimpleCell,
        sortProps: {
            ariaLabelAscending: "Sorted low to high",
            ariaLabelDescending: "Sorted high to low"
        },
        width: new ObservableValue(100)
    },
    {
        id: "Reason",
        maxWidth: 300,
        name: "Reason",
        onSize: onSize,
        renderCell: renderSimpleCell,
        sortProps: {
            ariaLabelAscending: "Sorted low to high",
            ariaLabelDescending: "Sorted high to low"
        },
        width: new ObservableValue(100)
    },
    {
        id: "DateModified",
        maxWidth: 300,
        name: "Modified",
        onSize: onSize,
        renderCell: renderSimpleCell,
        sortProps: {
            ariaLabelAscending: "Sorted low to high",
            ariaLabelDescending: "Sorted high to low"
        },
        width: new ObservableValue(150)
    }
    //ColumnFill
];

//var tableItems = new ObservableArray<ITableItem>(rawTableItems);

// const sortingBehavior = new ColumnSorting<ITableItem>(
//     (
//         columnIndex: number,
//         proposedSortOrder: SortOrder,
//         event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>
//     ) => {
//         tableItems.splice(
//             0,
//             tableItems.length,
//             ...sortItems<ITableItem>(
//                 columnIndex,
//                 proposedSortOrder,
//                 sortFunctions,
//                 columns,
//                 rawTableItems
//             )
//         );
//     }
// );

const sortFunctions = [
    // Sort on Name column
    // (item1: ITableItem, item2: ITableItem): number => {
    //     return item1.Id.text!.localeCompare(item2.Id.text!);
    // },

    // Sort on Age column
    (item1: ITableItem, item2: ITableItem): number => {
        return item1.Id - item2.Id;
    },

    // Gender column does not need a sort function
    null
];

function onSize(event: MouseEvent, index: number, width: number) {
    (columns[index].width as ObservableValue<number>).value = width;
}