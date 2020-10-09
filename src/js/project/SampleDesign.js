import React from "react";

import {formatNumberWithCommas, encodeFileAsBase64} from "../utils/generalUtils";
import {ProjectContext, perPlotLimit, sampleLimit} from "./constants";

export class SampleDesign extends React.Component {
    constructor(props) {
        super(props);
    }

    /// Render Functions

    renderLabeledInput = (label, property) => (
        <div className="form-group">
            <label htmlFor={property}>{label}</label>
            <input
                className="form-control form-control-sm"
                type="number"
                id={property}
                min="0"
                step="1"
                value={this.context[property] || ""}
                onChange={e => this.context.setProjectState({[property]: e.target.value})}
            />
        </div>
    )

    renderPlotShape = () => {
        const {plotShape, setProjectState} = this.context;
        return (
            <div className="form-group" style={{display: "flex", flexDirection: "column"}}>
                <label>Plot Shape</label>
                <div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="plot-shape-circle"
                            checked={plotShape === "circle"}
                            onChange={() => setProjectState({plotShape: "circle"})}
                        />
                        <label
                            className="form-check-label"
                            htmlFor="plot-shape-circle"
                        >
                            Circle
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="plot-shape-square"
                            checked={plotShape === "square"}
                            onChange={() => setProjectState({plotShape: "square"})}
                        />
                        <label
                            className="form-check-label"
                            htmlFor="plot-shape-square"
                        >
                            Square
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    renderFileInput = (fileType) => (
        <div style={{display: "flex"}}>
            <label
                className="btn btn-sm btn-block btn-outline-lightgreen btn-file py-0 text-nowrap"
                style={{display: "flex", alignItems: "center", width: "fit-content"}}
                id="custom-upload"
                htmlFor="plot-distribution-file"
            >
                Upload File
                <input
                    type="file"
                    accept={fileType === "csv" ? "text/csv" : "application/zip"}
                    id="plot-distribution-file"
                    defaultValue=""
                    name="plot-distribution-file"
                    onChange={e => {
                        this.context.setProjectState({plotFileName: e.target.files[0].name});
                        encodeFileAsBase64(e.target.files[0], base64 => this.context.setProjectState({plotFileBase64: base64}));
                    }}
                    style={{display: "none"}}
                />
            </label>
            <label className="ml-3 text-nowrap">
                File: {!this.context.plotFileName ? <span className="font-italic">None</span> : this.context.plotFileName}
            </label>
        </div>
    );

    renderCSV = () => (
        <div style={{display: "flex", flexDirection: "column"}}>
            {this.renderFileInput("csv")}
            <div style={{display: "flex"}}>
                {this.renderPlotShape()}
                {this.renderLabeledInput("Diameter (m)", "plotSize")}
            </div>
        </div>
    )

    render() {
        const {plotDistribution, sampleDistribution, allowDrawnSamples, setProjectState} = this.context;
        const totalPlots = this.props.getTotalPlots();
        const samplesPerPlot = this.props.getSamplesPerPlot();

        const sampleOptions = {
            random: {
                display: "Random",
                description: "Sample points will be randomly distributed within the plot boundary.",
                inputs: [() => this.renderLabeledInput("Number of samples", "samplesPerPlot")],
                disabled: plotDistribution === "shp",
            },
            gridded: {
                display: "Gridded",
                description: "Sample points will be arranged on a grid within the plot boundary using the sample spacing selected below.",
                inputs: [() => this.renderLabeledInput("Sample spacing (m)", "sampleResolution")],
                disabled: plotDistribution === "shp",
            },
            center: {
                display: "Center",
                description: "A single sample point will be placed on the center of the plot.",
                inputs: [],
            },
            csv: {
                display: "CSV File",
                description: "Specify your own sample points by uploading a CSV with these fields: LON,LAT,PLOTID,SAMPLEID.",
                inputs: [() => this.renderFileInput("csv")],
                disabled: !["csv", "shp"].includes(plotDistribution),
            },
            shp: {
                display: "SHP File",
                description: "Specify your own sample shapes by uploading a zipped Shapefile (containing SHP, SHX, DBF, and PRJ files) of polygon features. Each feature must have PLOTID and SAMPLEID fields.",
                inputs: [() => this.renderFileInput("shp")],
                disabled: !["csv", "shp"].includes(plotDistribution),
            },
            none: {
                display: "None",
                description: "Do not predefine any samples. Requires users to draw their own plots during collection.",
                inputs: [() => <h3>Users will draw samples at collection time.</h3>],

            },
        };

        return (
            <div id="sample-design">
                <h2>Sample Generation</h2>
                <div className="form-check form-check-inline">
                    <label>Spatial Distribution</label>
                    <select
                        className="form-control form-control-sm ml-3"
                        style={{width: "initial"}}
                        onChange={(e) => this.context.setProjectState({sampleDistribution: e.target.value})}
                        value={sampleDistribution}
                    >
                        {Object.entries(sampleOptions).map(([key, options]) =>
                            <option key={key} value={key} disabled={options.disabled}>
                                {options.display}
                            </option>
                        )}
                    </select>
                </div>
                <p id="sample-design-text" className="font-italic ml-2 small">-
                    {sampleOptions[sampleDistribution].description}
                </p>
                {sampleDistribution !== "none" &&
                <div className="form-check form-check-inline mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="allow-drawn-samples"
                        onChange={() => setProjectState({allowDrawnSamples: !allowDrawnSamples})}
                        checked={allowDrawnSamples || sampleDistribution === "none"}
                    />
                    <label
                        className="form-check-label"
                        htmlFor="allow-drawn-samples"
                    >
                        Allow users to draw their own samples
                    </label>
                </div>
                }
                <div style={{display: "flex"}}>
                    {sampleOptions[sampleDistribution].inputs.map((i, idx)=>
                        <div key={idx} className="mr-3">
                            {i.call(this)}
                        </div>
                    )}
                </div>
                <p
                    className="font-italic ml-2 small"
                    style={{
                        color: samplesPerPlot > perPlotLimit ? "#8B0000" : "#006400",
                        fontSize: "1rem",
                        whiteSpace: "pre-line",
                    }}
                >
                    {samplesPerPlot
                        ? `Each plot will contain around ${formatNumberWithCommas(samplesPerPlot)} samples.`
                        : ""
                    }
                    {totalPlots && samplesPerPlot
                        ? `\nThere will be around ${formatNumberWithCommas(totalPlots * samplesPerPlot)} `
                            + "total samples in the project."
                        : ""
                    }
                    {totalPlots && samplesPerPlot && samplesPerPlot > perPlotLimit
                        ? `\n * The maximum allowed for the selected sample distribution is ${formatNumberWithCommas(perPlotLimit)}`
                            + ` samples per plot.\n * The maximum allowed samples per project is ${formatNumberWithCommas(sampleLimit)}.`
                        : ""
                    }
                </p>
            </div>
        );
    }
}
SampleDesign.contextType = ProjectContext;

export function SampleReview() {
    return (
        <ProjectContext.Consumer>
            {({sampleDistribution, samplesPerPlot, sampleResolution, allowDrawnSamples}) =>
                <div id="sample-review">
                    <h3 className="mb-3">Samples will be copied from template project</h3>
                    {sampleDistribution === "none"
                    ?
                        <h3>No samples are predefined.</h3>
                    : (
                        <div className="d-flex">
                            <div id="sample-review-col1">
                                <table id="sample-review-table" className="table table-sm">
                                    <tbody>
                                        <tr>
                                            <td className="w-80 pr-5">Spatial Distribution</td>
                                            <td className="w-20 text-center">
                                                <span className="badge badge-pill bg-lightgreen">{sampleDistribution}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="w-80">Samples Per Plot</td>
                                            <td className="w-20 text-center">
                                                <span className="badge badge-pill bg-lightgreen">{samplesPerPlot} /plot</span>
                                            </td>
                                        </tr>
                                        {sampleDistribution === "gridded" &&
                                        <tr>
                                            <td className="w-80">Sample Spacing</td>
                                            <td className="w-20 text-center">
                                                <span className="badge badge-pill bg-lightgreen">{sampleResolution} m</span>
                                            </td>
                                        </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {allowDrawnSamples && <h3>Users can draw additional samples at collection time.</h3>}
                </div>
            }
        </ProjectContext.Consumer>
    );
}
