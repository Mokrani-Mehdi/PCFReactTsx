import { Department,Workforce,Shift,PlanningSchedule } from "../Models/DisplayReactComponentModels";

export interface IWorkforceDisplayProps {
  workforceData: {
    workforces: Workforce[];
    departmentSkillsLists: Department[];
    planningSchedule : PlanningSchedule;
  };
  onWorkerSelect?: (workerId: string) => void;
  onShiftSelect?: (workerId: string, shift: Shift) => void;
  notifyOutputChanged?: () => void;
  onPayloadUpdate?: (newPayload: { workforces: Workforce[]; departmentSkillsLists: Department[] }) => void;
  onValidate?: (updatedShifts : Shift[]) => void;
}