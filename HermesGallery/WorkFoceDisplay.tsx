import * as React from "react";
import './DisplayReactComponent.css'


export interface Shift {
  ava_departmentcolor?: string;
  ava_isassigned?: boolean;
  ava_keyholderresponsabilitycode?: number | null;
  ava_name?: string;
  ava_planningdetailsid?: string;
  ava_shiftday?: string;
  isDeleted: boolean;
  isEdited: boolean;
  isSwap: boolean;
  workforceId?: string;
}

export interface Workforce {
  ava_contractenddatecode: string | null;
  ava_contractstartdate: string | null;
  ava_isprofilcreated: boolean;
  ava_name?: string;
  ava_rolecode?: number;
  ava_workforceid: string;
  statecode: number;
  Shifts: Shift[];
}

export interface IWorkforceDisplayProps {
  workforceData: Workforce[];
  onWorkerSelect?: (workerId: string) => void;
  onShiftSelect?: (workerId: string, shift: Shift) => void;
  notifyOutputChanged?: () => void;
}

export const WorkforceDisplay: React.FC<IWorkforceDisplayProps> = ({ 
  workforceData, 
  onWorkerSelect,
  onShiftSelect,
  notifyOutputChanged 
}) => {
  const [selectedWorker, setSelectedWorker] = React.useState<string | null>(null);
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);

  const getWorkerShifts = (workforceid: string) => {
    return workforceData.find(worker => worker.ava_workforceid === workforceid)?.Shifts || [];
  };

  const handleWorkerClick = (workerId: string) => {
    setSelectedWorker(workerId);
    setSelectedShift(null);
    
    if (onWorkerSelect) {
      onWorkerSelect(workerId);
    }
    
    // Notify PCF of the change
    if (notifyOutputChanged) {
      notifyOutputChanged();
    }
  };

  const handleShiftClick = (workerId: string, shift: Shift) => {
    setSelectedShift(shift);
    
    if (onShiftSelect) {
      onShiftSelect(workerId, shift);
    }
    
    // Notify PCF of the change
    if (notifyOutputChanged) {
      notifyOutputChanged();
    }
  };

  // Method to get the current selected values (can be used by PCF)
  const getOutputs = () => {
    return {
      selectedWorkerId: selectedWorker,
      selectedShiftDetails: selectedShift,
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Workforce Schedule</h2>
      
      {/* Workers List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Workers</h3>
        <div>
          {workforceData.map((worker) => (
            <div
              key={worker.ava_workforceid}
              className={`p-3 border rounded cursor-pointer mb-2 hover:bg-gray-50 ${
                selectedWorker === worker.ava_workforceid ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleWorkerClick(worker.ava_workforceid)}
            >
              <p className="font-medium">{worker.ava_name}</p>
              <p className="text-sm text-gray-600">ID: {worker.ava_workforceid}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Worker's Shifts */}
      {selectedWorker && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Shifts</h3>
          <div>
            {getWorkerShifts(selectedWorker).map((shift, index) => (
              <div
                key={index}
                className={`p-3 rounded mb-2 cursor-pointer ${
                  selectedShift === shift ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: shift.ava_departmentcolor || '#f3f4f6'
                }}
                onClick={() => handleShiftClick(selectedWorker, shift)}
              >
                <p className="font-medium">{shift.ava_name}</p>
                <p className="text-sm">{shift.ava_shiftday}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};