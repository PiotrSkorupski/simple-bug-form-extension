import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Panel } from "azure-devops-ui/Panel";

import { IViewBugPanelState } from './ViewBugPanel.State';
import { IViewBugPanelProperties } from './ViewBugPanel.Props';
import { TaskAgentUpdateReasonType } from "TFS/DistributedTask/Contracts";

export class ViewBugPanel extends React.Component<IViewBugPanelProperties, IViewBugPanelState> {
    constructor(props: IViewBugPanelProperties) {
        super(props);
        this.state = { 
            expanded: false,
            resolveButtonDisabled: false,
            rejectButtonDisabled: false
        };
    }

    public render(): JSX.Element {
        return (
            <div>
                {this.state.expanded && (<Panel
                    onDismiss={() => this.setState({ expanded: false })}
                    titleProps={{ text: "Resolve/Reject Bug" }}
                    description={
                        "To resolve a bug or issue, please click Resolve button. To resolve a bug or issue, please click Reject button."
                    }
                    footerButtonProps={[
                        { text: "Resolve", primary: true, onClick: () => this.ResolveBug(), disabled: this.state.resolveButtonDisabled },
                        { text: "Reject", danger: true, onClick: () => this.RejectBug(), disabled: this.state.rejectButtonDisabled }
                    ]}
                >
                </Panel>)}
            </div>
        );
    }

    private ResolveBug() {

    }

    private RejectBug() {

    }

    public showPanel() {
        this.setState({expanded: true})
    }
}