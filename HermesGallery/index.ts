import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { WorkforceDisplay} from "./DisplayReactComponent";

import { Shift } from "./Models/DisplayReactComponentModels";
import { IWorkforceDisplayProps } from "./Interfaces/DisplayReactComponentInterface";
import workforceJson from "../Payload/Payload0003.json";

interface IState {
    selectedWorkerId: string | null;
    selectedShift: Shift | null;
    responseData: Shift[] | null;
    isFromValidation: boolean;
}

export class HermesPlanning2 implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private state: IState;

    constructor() {
        this.state = {
            selectedWorkerId: null,
            selectedShift: null,
            responseData: null,
            isFromValidation: false
        };
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    private setState = (newState: Partial<IState>): void => {
        this.state = {
            ...this.state,
            ...newState
        };
        this.notifyOutputChanged();
    };

    private handleWorkerSelect = (workerId: string): void => {
        this.setState({
            selectedWorkerId: workerId,
            selectedShift: null,
            responseData: null,
            isFromValidation: false
        });
    };

    private HandlePayloadUpdate = (updatedShifts: Shift[]): void => {
        this.setState({
            responseData: updatedShifts,
            isFromValidation: true
        });
    };

    private handleShiftSelect = (workerId: string, shift: Shift): void => {
        this.setState({
            selectedWorkerId: workerId,
            selectedShift: shift,
            responseData: null,
            isFromValidation: false
        });
    };
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        let workforceData;

    try {
        workforceData = context.parameters.Payload.raw
            ? (JSON.parse(context.parameters.Payload.raw) ) 
            : workforceJson  ;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        workforceData = workforceJson  ;
    }

    const props: IWorkforceDisplayProps = {
        workforceData,
        onWorkerSelect: this.handleWorkerSelect,
        onShiftSelect: this.handleShiftSelect,
        notifyOutputChanged: this.notifyOutputChanged,
        onValidate: this.HandlePayloadUpdate
    };
        return React.createElement(WorkforceDisplay, props);
      }

    public getOutputs(): IOutputs {
        const response = this.state.responseData ? {
            data: this.state.responseData,
            isFromValidation: this.state.isFromValidation
        } : null;

        return {
            selectedWorkerId: this.state.selectedWorkerId || "",
            selectedShiftDetails: this.state.selectedShift ? JSON.stringify(this.state.selectedShift) : "",
            response: response ? JSON.stringify(response) : ""
        };
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}