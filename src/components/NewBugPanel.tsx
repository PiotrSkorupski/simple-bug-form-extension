import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Panel } from "azure-devops-ui/Panel";
import { INewBugPanelState } from "./NewBugPanel.Props";

export class NewBugPanel extends React.Component<{}, INewBugPanelState> {
    constructor(props: {}) {
        super(props);
        this.state = { expanded: false };
    }

    public render(): JSX.Element {
        return (
            <div>
                {this.state.expanded && (
                    <Panel
                        onDismiss={() => this.setState({ expanded: false })}
                        titleProps={{ text: "Bug report from" }}
                        description={
                            "To report a bug or issue, please fill below form and click Create button."
                        }
                        footerButtonProps={[
                            { text: "Cancel", onClick: () => this.setState({ expanded: false }) },
                            { text: "Create", primary: true }
                        ]}
                    >
                        <div style={{ height: "1200px" }}>Panel Content</div>
                    </Panel>
                )}
            </div>
        );
    }

    public showPanel() {
        this.setState({expanded: true})
    }
}