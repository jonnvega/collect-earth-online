import React from "react";
import ReactDOM from "react-dom";

import {LoadingModal, NavigationBar} from "./components/PageComponents";
import CreateProjectWizard from "./project/CreateProjectWizard";
import ReviewChanges from "./project/ReviewChanges";
import ManageProject from "./project/ManageProject";

import {ProjectContext} from "./project/constants";

class Project extends React.Component {
    constructor(props) {
        super(props);

        this.blankProject = {
            institution: -1,
            name: "",
            description: "",
            projectOptions: {
                showGEEScript: false,
                showPlotInformation: false,
                autoLaunchGeoDash: true,
            },
            plotDistribution: "random",
            imageryId: -1,
            boundary: null,
            numPlots: "",
            plotSpacing: "",
            plotShape: "square",
            plotSize: "",
            sampleDistribution: "random",
            sampleResolution: "",
            samplesPerPlot: "",
            allowDrawnSamples: false,
            surveyQuestions: [],
            surveyRules: [],
            templateProjectId: -1,
            useTemplateWidgets: false,
            useTemplatePlots: false,
            projectImageryList: [],
            plots: [],
        };

        this.modes = {
            wizard: CreateProjectWizard,
            review: ReviewChanges,
            manage: ManageProject,
            loading: () => null,
        };

        this.state = {
            projectDetails: {...this.blankProject, privacyLevel: "institution"},
            institutionImagery: [],
            designMode: "loading",
            modalMessage: null,
        };
    }

    /// Lifecycle Methods

    componentDidMount() {
        if (this.props.projectId > 0) {
            this.setState({designMode: "manage"});
        } else if (this.props.institutionId > 0) {
            this.setState({designMode: "wizard"});
            this.getInstitutionImagery(this.props.institutionId);
        } else {
            alert("Invalid URL.");
            window.location = "/home";
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {plotDistribution, sampleDistribution, institution} = this.state.projectDetails;

        if (plotDistribution !== prevState.projectDetails.plotDistribution) {
            const newSampleDistribution = ["random", "gridded"].includes(plotDistribution) && ["csv", "shp"].includes(sampleDistribution)
                ? "random"
                : plotDistribution === "shp" && ["random", "gridded"].includes(sampleDistribution)
                ? "shp"
                : sampleDistribution;
            if (newSampleDistribution !== sampleDistribution) this.setProjectState({sampleDistribution: newSampleDistribution});
        }

        if (institution !== prevState.projectDetails.institution) {
            this.getInstitutionImagery(institution);
        }
    }

    /// Updating State

    setProjectState = (newValue, callBack = () => null) =>
        this.setState({projectDetails: {...this.state.projectDetails, ...newValue}}, callBack);

    resetProject = (defaults) => this.setState({projectDetails: this.blankProject, ...defaults});

    setDesignMode = (newMode) => this.setState({designMode: newMode});

    /// API Calls

    getInstitutionImagery = (institutionId) =>
        fetch(`/get-institution-imagery?institutionId=${institutionId}`)
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(data => {
                const sorted = [...data.filter(a => a.title.toLocaleLowerCase().includes("mapbox")),
                                ...data.filter(a => !a.title.toLocaleLowerCase().includes("mapbox"))];
                this.setState({institutionImagery: sorted});
                this.setProjectState({imageryId: sorted[0].id});
            })
            .catch(response => {
                console.log(response);
                alert("Error retrieving the imagery list. See console for details.");
            });

    /// Functions

    processModal = (message, callBack) => {
        this.setState({modalMessage: message},
                      () => callBack.call(this)
                          .finally(() => this.setState({modalMessage: null})));
    };

    render() {
        const CurrentComponent = this.modes[this.state.designMode];
        return (
            <ProjectContext.Provider
                value={{
                    institutionId: this.props.institutionId,
                    projectId: this.props.projectId,
                    ...this.state.projectDetails,
                    designMode: this.state.designMode,
                    institutionImagery: this.state.institutionImagery,
                    setProjectState: this.setProjectState,
                    setDesignMode: this.setDesignMode,
                    resetProject: this.resetProject,
                    processModal: this.processModal,
                }}
            >
                {this.state.modalMessage && <LoadingModal message={this.state.modalMessage}/>}
                <div>
                    <CurrentComponent/>
                </div>
            </ProjectContext.Provider>
        );
    }
}

export function pageInit(args) {
    ReactDOM.render(
        <NavigationBar userName={args.userName} userId={args.userId}>
            <Project
                institutionId={parseInt(args.institutionId) || -1}
                projectId={parseInt(args.projectId) || -1}
            />
        </NavigationBar>,
        document.getElementById("app")
    );
}
