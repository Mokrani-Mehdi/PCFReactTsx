import * as React from "react";
import { useState, useEffect } from "react";
import { Shift, Skill, Workforce } from "../Models/DisplayReactComponentModels";
import "./ShiftModal.css";

interface ShiftModalProps {
  isOpen: boolean;
  selectedWorker: string | null;
  selectedShift: Shift | null;
  departmentData: any[];
  isCreateMode: boolean;
  selectedDate?: Date | null;
  workforces: Workforce[];
  onClose: () => void;
  onConfirm: (updatedShift: Shift) => void;
  onCreateShift?: (newShift: Shift) => void;
  onSwapShift?: (shift1: Shift, shift2: Shift) => void;
  ShiftsDates: string[];
  Shifts : Workforce[];
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  selectedWorker,
  selectedShift,
  departmentData,
  isCreateMode,
  selectedDate,
  workforces,
  onClose,
  onConfirm,
  onCreateShift,
  onSwapShift,
  ShiftsDates,
  Shifts,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [originalDepartment, setOriginalDepartment] = useState<string>("");
  const [originalSkill, setOriginalSkill] = useState<string>("");
  const [isRecreatingShift, setIsRecreatingShift] = useState<boolean>(false);
  const [isSwapSelected, setIsSwapSelected] = useState<boolean>(false);
  const [swapWorker, setSwapWorker] = useState<string>("");
  const [swapDate, setSwapDate] = useState<string>("");


  // Filtered workers for swap dropdown
  const availableWorkers = React.useMemo(() => {
    return workforces
      .filter(w => w.ava_name !== selectedWorker)
      .map(w => w.ava_name);
  }, [workforces, selectedWorker]);

  useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        if (selectedShift && selectedShift.isDeleted) {
          setIsRecreatingShift(true);
          // Reset fields for recreating a deleted shift
          setSelectedDepartment("");
          setSelectedSkill("");
          setOriginalDepartment("");
          setOriginalSkill("");
        } else {
          // Regular create mode
          setIsRecreatingShift(false);
          setSelectedDepartment("");
          setSelectedSkill("");
          setOriginalDepartment("");
          setOriginalSkill("");
        }
      } else if (selectedShift) {
        setIsRecreatingShift(false);

        // Set fields for update mode
        const department = departmentData.find(
          (dept) =>
            dept.Departementid === selectedShift.DepartmentId ||
            dept.HexColor === selectedShift.ava_departmentcolor
        );

        if (department) {
          setSelectedDepartment(department.Departementid);
          setOriginalDepartment(department.Departementid);

          if (selectedShift.SkillId) {
            setSelectedSkill(selectedShift.SkillId);
            setOriginalSkill(selectedShift.SkillId);
          } else {
            setSelectedSkill("");
            setOriginalSkill("");
          }
        }
      }
    }
  }, [isOpen, selectedShift, departmentData, isCreateMode]);

  const getSkillsForDepartment = (departmentId: string) => {
    const department = departmentData.find(
      (dept) => dept.Departementid === departmentId
    );
    return department?.Skills || [];
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSelectedSkill("");
  };

  const handleConfirmClick = () => {
    if (!selectedWorker || !selectedShift) return;

    if (isSwapSelected && onSwapShift) {
      // Swap shift logic
      if (!swapWorker) {
        alert("Please select a worker to swap with.");
        return;
      }

      // Find the shift for the swap worker on the same day
      const swapWorkerShift = workforces
        .find(w => w.ava_name === swapWorker)
        ?.Shifts.find(s => s.ava_shiftday === selectedShift.ava_shiftday);

      if (!swapWorkerShift) {
        alert("No shift found for the selected worker on this day.");
        return;
      }

      // Swap the shifts
      const swappedShift1 = {
        ...selectedShift,
        workforceId: swapWorker,
        ava_name: swapWorker,
        isSwap: true,
        isEdited: true
      };

      const swappedShift2 = {
        ...swapWorkerShift,
        workforceId: selectedWorker,
        ava_name: selectedWorker,
        isSwap: true,
        isEdited: true
      };

      onSwapShift(swappedShift1, swappedShift2);
      onClose();
    } else if (!isCreateMode && onConfirm) {
      // Existing shift update logic
      if (selectedShift.ava_absencereasonid) {
        // If it's an absence, just confirm without changes
        onConfirm(selectedShift);
        onClose();
        return;
      }

      const selectedDepartmentData = departmentData.find(
        (dept) => dept.Departementid === selectedDepartment
      );

      if (!selectedDepartmentData) return;

      const selectedSkillData = selectedSkill
        ? selectedDepartmentData.Skills.find(
            (skill: Skill) => skill.SkillId === selectedSkill
          )
        : null;

      const updatedShift = {
        ...selectedShift,
        ava_departmentcolor: selectedDepartmentData.HexColor,
        DepartmentId: selectedDepartment,
        SkillId: selectedSkill || undefined,
        SkillName: selectedSkillData ? selectedSkillData.Name : undefined,
        DepartmentName: selectedDepartmentData.DepartmentName,
        isEdited: true,
      };

      onConfirm(updatedShift);
    }

    onClose();
  };

  // Render absence or regular shift details
  const renderShiftDetails = () => {
    // If absence exists, show absence details
    if (selectedShift?.ava_absencereasonid) {
      return (
        <>
          <div className="form-row">
            <label>Absence Reason</label>
            <input
              type="text"
              value={selectedShift.ava_absencereasonName || 'Unknown Absence'}              
              className="form-control"
            />
          </div>
        </>
      );
    }

    // Regular shift details
    return (
      <>
        <div className="form-row">
          <label>Department</label>
          <select
            className="form-select"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            
          >
            <option value="">Select Department</option>
            {departmentData.map((dept) => (
              <option key={dept.Departementid} value={dept.Departementid}>
                {dept.DepartmentName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Skill</label>
          <select
            className="form-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            disabled={!selectedDepartment}
          >
            <option value="">Select Skill</option>
            {getSkillsForDepartment(selectedDepartment).map(
              (skill: Skill) => (
                <option key={skill.SkillId} value={skill.SkillId}>
                  {skill.Name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="form-row">
                  <label>Time slot</label>
                  <input 
                    type="text" 
                    value={`${selectedShift?.ava_SpecificScheduleStart || '09:00'} - ${selectedShift?.ava_SpecificScheduleEnd || '17:00'}`} 
                    readOnly 
                  />
                </div>
                <div className="form-row lunch-break-row">
                  <label>Lunch break</label>
                  <input 
                    type="text" 
                    value={`${selectedShift?.ava_lunchtimeStart || '12:00'} - ${selectedShift?.ava_lunchtimeEnd || '13:00'}`} 
                    readOnly
                  />
                  <span className="delete-icon">🗑️</span>
                </div>
      </>
    );
  };
  const renderShiftDetailsForSwap = () => {
    // If absence exists, show absence details
    if (selectedShift?.ava_absencereasonid) {
      return (
        <>
          <div className="form-row">
            <label>Absence Reason</label>
            <input
              type="text"
              value={selectedShift.ava_absencereasonName || 'Unknown Absence'}              
              className="form-control"
              readOnly
            />
          </div>
        </>
      );
    }

    // Regular shift details
    return (
      <>
        <div className="form-row">
          <label>Department</label>
          <select
            className="form-select"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            disabled
          >
            <option value="">Select Department</option>
            {departmentData.map((dept) => (
              <option key={dept.Departementid} value={dept.Departementid}>
                {dept.DepartmentName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Skill</label>
          <select
            className="form-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            disabled
          >
            <option value="">Select Skill</option>
            {getSkillsForDepartment(selectedDepartment).map(
              (skill: Skill) => (
                <option key={skill.SkillId} value={skill.SkillId}>
                  {skill.Name}
                </option>
              )
            )}
          </select>
        </div>
        <div className="form-row">
                  <label>Time slot</label>
                  <input 
                    type="text" 
                    value={`${selectedShift?.ava_SpecificScheduleStart || '09:00'} - ${selectedShift?.ava_SpecificScheduleEnd || '17:00'}`} 
                    readOnly 
                  />
                </div>
                <div className="form-row lunch-break-row">
                  <label>Lunch break</label>
                  <input 
                    type="text" 
                    value={`${selectedShift?.ava_lunchtimeStart || '12:00'} - ${selectedShift?.ava_lunchtimeEnd || '13:00'}`} 
                    readOnly
                  />
                  <span className="delete-icon">🗑️</span>
                </div>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">         
          <button 
            className={!isSwapSelected ? "header-btn Selected-btn" : "header-btn NonSelected-btn"} 
            onClick={() => setIsSwapSelected(false)}
          >
            Modify<span className="edit-icon">✏️</span>
          </button>
          <button 
            className={isSwapSelected ? "header-btn Selected-btn" : "header-btn NonSelected-btn"} 
            onClick={() => setIsSwapSelected(true)}
          >
            Swap<span className="swap-icon">🔄</span>
          </button>
        </div>
        {isSwapSelected ? (
           <div className="modal-body">
            <div className="SelectedWorkerColumn">
            <div className="form-row">
             <label>Staff member</label>
             <input
               type="text"
               value={selectedWorker || ""}
               readOnly
               className="form-control"
             />
           </div>
           <div className="form-row">
             <label>Date</label>
             <input
               type="text"
               value={selectedShift?.ava_shiftday || ""}
               readOnly
               className="form-control"
             />
           </div>
           {renderShiftDetailsForSwap()} </div>
            <div className="SwapedWorkerColumn"> 
            <div className="form-row">
              <label>Swap with</label>
              <select
                className="form-select"
                value={swapWorker}
                onChange={(e) => setSwapWorker(e.target.value)}
              >
                <option value="">Select Worker</option>
                {availableWorkers.map(worker => (
                  <option key={worker} value={worker}>
                    {worker}
                  </option>
                ))}
              </select>
            </div>
           <div className="form-row">
             <label>Date</label>
             
             <select
                className="form-select"
                value={swapDate}
                onChange={(e) => setSwapDate(e.target.value)}
              >
                <option value="">Select Date</option>
                {ShiftsDates.map(shifts => (
                  <option key={shifts} value={shifts}>
                    {shifts}
                  </option>
                ))}
              </select>
           </div>
           {renderShiftDetailsForSwap()}
            </div>
          
          
          
         </div>
          ) : (
            // Conditional rendering of shift details
            <div className="modal-body">
            <div className="form-row">
              <label>Staff member</label>
              <input
                type="text"
                value={selectedWorker || ""}
                readOnly
                className="form-control"
              />
            </div>
            <div className="form-row">
              <label>Date</label>
              <input
                type="text"
                value={selectedShift?.ava_shiftday || ""}
                readOnly
                className="form-control"
              />
            </div>
            {renderShiftDetails()}
        
          </div>
          )}


        
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-confirm" 
            onClick={handleConfirmClick}
            disabled={isSwapSelected && !swapWorker}
          >
            {isSwapSelected ? "Swap" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;