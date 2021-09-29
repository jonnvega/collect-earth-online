import React from "react";

import {ProjectContext} from "./constants";
import Select from "../components/Select";
import {formatNumberWithCommas} from "../utils/generalUtils";

export default class QualityControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: -1
        };
    }

    getAssignment = () => this.context.designSettings.qaqcAssignment;

    getUserAssignment = () => this.context.designSettings.userAssignment;

    setAssignment = newAssignment => {
        const assignment = this.getAssignment();
        this.context.setProjectDetails({
            designSettings: {...this.context.designSettings, qaqcAssignment: {...assignment, ...newAssignment}}
        });
    };

    setMethod = qaqcMethod => this.setAssignment({qaqcMethod});

    setPercent = percent => this.setAssignment({percent});

    setTimesToReview = timesToReview => this.setAssignment({timesToReview});

    resetSelectedUser = () => this.setState({selectedUser: -1});

    addSME = id => {
        const {smes} = this.getAssignment();
        this.setAssignment({smes: [...smes, id]});
        this.resetSelectedUser();
    };

    removeSME = id => {
        const {smes} = this.getAssignment();
        this.setAssignment({smes: smes.filter(s => s !== id)});
        this.resetSelectedUser();
    };

    renderAssignedSMEs = assignedSMEs => (
        <div className="d-flex flex-column my-3">
            {assignedSMEs.map(({id, email}) => (
                <div key={id} className="d-flex mt-1">
                    <button
                        className="btn btn-sm btn-danger mx-2"
                        onClick={() => this.removeSME(id)}
                        title={`Remove ${email}`}
                        type="button"
                    >
                        -
                    </button>
                    <div
                        style={{
                            background: "white",
                            border: "1px solid #ced4da",
                            borderRadius: ".25rem",
                            fontSize: ".875rem",
                            padding: ".25rem .5rem"
                        }}
                    >
                        {email}
                    </div>
                </div>
            ))}
        </div>
    );

    render() {
        const qualityMethods = [
            ["none", "None"],
            ["overlap", "Overlap"],
            ["sme", "SME Verification"]
        ];
        const {qaqcMethod, percent, smes, timesToReview} = this.getAssignment();
        const {userMethod} = this.getUserAssignment();
        const {allowDrawnSamples} = this.context;
        const {selectedUser} = this.state;
        const {institutionUserList, totalPlots} = this.props;
        const possibleSMEs = [
            {id: -1, email: "Select user..."},
            ...institutionUserList.filter(({id}) => !smes.includes(id))
        ];
        const assignedSMEs = institutionUserList.filter(({id}) => smes.includes(id));
        const plotsToReview = Math.round(totalPlots * (percent / 100));
        const plotsPerSME = Math.round(plotsToReview / smes.length);

        return (
            <div className="col-6">
                <h3 className="mb-3">Quality Control</h3>
                <div className="d-flex">
                    <Select
                        disabled={allowDrawnSamples || userMethod === "none"}
                        id="quality-mode"
                        label="Quality Mode"
                        onChange={e => this.setMethod(e.target.value)}
                        options={qualityMethods}
                        value={qaqcMethod}
                    />
                </div>
                {allowDrawnSamples ? (
                    <p className="font-italic mt-2 small">
                        When User-Drawn samples are enabled, the project cannot support Quality Control of plots.
                        Disable User-Drawn samples to re-enable Quality Control.
                    </p>
                ) : userMethod === "none" && (
                    <p className="font-italic mt-2 small">
                        Please assign users to enable Quality Control.
                    </p>

                )}
                {qaqcMethod !== "none" && (
                    <div className="d-flex flex-column mt-3">
                        <label htmlFor="percent">Percent:</label>
                        <p className="font-italic ml-2 small">
                            - Percent of each users plots to review
                        </p>
                        <div className="d-flex mx-3">
                            <input
                                id="percent"
                                max="100"
                                min="0"
                                onChange={e => this.setPercent(parseInt(e.target.value))}
                                steps="5"
                                type="range"
                                value={percent}
                            />
                            <div style={{fontSize: "0.9rem", margin: "0.25rem 1rem"}}>
                                {percent}%
                            </div>
                        </div>
                    </div>
                )}
                {qaqcMethod === "overlap" && (
                    <>
                        <div className="mt-3 form-inline">
                            <label htmlFor="reviews"># of Reviews:</label>
                            <input
                                className="form-control form-control-sm ml-3"
                                id="reviews"
                                max="100"
                                min="2"
                                onChange={e => this.setTimesToReview(parseInt(e.target.value))}
                                type="number"
                                value={timesToReview}
                            />
                        </div>
                        <p className="font-italic mt-2 small">
                            - Plots to review: {formatNumberWithCommas(plotsToReview)}
                        </p>
                    </>
                )}

                {qaqcMethod === "sme" && (
                    <div className="mt-3">
                        <div className="d-flex">
                            <Select
                                disabled={possibleSMEs.length === 1}
                                id="assigned-smes"
                                label="Assigned SMEs"
                                labelKey="email"
                                onChange={e => this.setState({selectedUser: parseInt(e.target.value)})}
                                options={possibleSMEs.length > 1 ? possibleSMEs : ["No Users to Assign"]}
                                valueKey="id"
                            />
                            <button
                                className="btn btn-sm btn-success mx-2"
                                disabled={possibleSMEs.length === 1 || selectedUser === -1}
                                onClick={() => this.addSME(selectedUser)}
                                title="Add User"
                                type="button"
                            >
                                +
                            </button>
                        </div>
                        {this.renderAssignedSMEs(assignedSMEs)}
                        <p className="font-italic ml-2 mb-0 small">
                            - SME: Subject Matter Expert
                        </p>
                        {smes.length > 0 && (
                            <p className="font-italic ml-2 small">
                                - Each SME will review ~{formatNumberWithCommas(plotsPerSME)} plots
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

QualityControl.contextType = ProjectContext;
