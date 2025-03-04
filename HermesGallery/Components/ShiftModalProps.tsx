import * as React from "react";
import { useState, useEffect } from "react";
import { Shift, Skill } from "../Models/DisplayReactComponentModels";
import "./ShiftModal.css";

interface ShiftModalProps {
  isOpen: boolean;
  selectedWorker: string | null;
  selectedShift: Shift | null;
  departmentData: any[];
  isCreateMode: boolean;
  selectedDate?: Date | null;
  onClose: () => void;
  onConfirm: (updatedShift: Shift) => void;
  onCreateShift?: (newShift: Shift) => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  selectedWorker,
  selectedShift,
  departmentData,
  isCreateMode,
  selectedDate,
  onClose,
  onConfirm,
  onCreateShift,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [originalDepartment, setOriginalDepartment] = useState<string>("");
  const [originalSkill, setOriginalSkill] = useState<string>("");
  const [isRecreatingShift, setIsRecreatingShift] = useState<boolean>(false);
  const [isSwapSelected, setisSwapSelected] = useState<boolean>(false);

  useEffect(() => {
    console.log("ShiftModal rendered");
  }, []);
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

  const isShiftModified = (): boolean => {
    if (isCreateMode) return true;

    const departmentChanged = selectedDepartment !== originalDepartment;
    const skillChanged = selectedSkill !== originalSkill;
    return departmentChanged || skillChanged;
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSelectedSkill("");
  };

  const handleConfirmClick = () => {
    if (!selectedWorker || !selectedDepartment) return;

    if (!isCreateMode && !isShiftModified()) {
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

    if (isCreateMode && onCreateShift) {
      const shiftDate =
        selectedDate ||
        (selectedShift?.ava_shiftday
          ? new Date(selectedShift.ava_shiftday)
          : new Date());

      // Create a new shift
      const newShift: Shift = {
        ava_planningdetailsid:
          isRecreatingShift && selectedShift
            ? selectedShift.ava_planningdetailsid
            : `new-${Date.now()}`,
        ava_shiftday: shiftDate.toISOString().split("T")[0],
        ava_departmentcolor: selectedDepartmentData.HexColor,
        DepartmentId: selectedDepartment,
        SkillId: selectedSkill || undefined,
        SkillName: selectedSkillData ? selectedSkillData.Name : undefined,
        DepartmentName: selectedDepartmentData.DepartmentName,
        ava_isassigned: true,
        ava_SpecificScheduleName: "E", // Default value
        ava_SpecificScheduleStart: "09:00", // Default values
        ava_SpecificScheduleEnd: "17:00",
        ava_lunchtimeStart: "12:00",
        ava_lunchtimeEnd: "13:00",
        isEdited: true,
        isNew: true,
        isDeleted: false,
        isSwap: false,
      } as Shift;

      onCreateShift(newShift);
    } else if (!isCreateMode && selectedShift) {
      // Update existing shift
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
  };

  if (!isOpen) return null;

  const modalTitle =
    isCreateMode || isRecreatingShift ? "Add Shift" : "Update Shift";

  return (
    <div className="modal-overlay" onClick={onClose}>
      {isCreateMode ? (
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
           
          <button className={ "header-btn Selected-btn"} >Add Shift</button>

           
          </div>
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
              value={
                isCreateMode
                  ? selectedDate
                    ? selectedDate.toISOString().split("T")[0]
                    : selectedShift?.ava_shiftday || ""
                  : selectedShift?.ava_shiftday || ""
              }
              readOnly
              className="form-control"
            />
            </div>
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
                <input type="text" value="09:00 AM - 06:00 PM" readOnly />
            </div>
            <div className="form-row lunch-break-row">
                <label>Lunch break</label>
                <input type="text" readOnly/>
                <span className="delete-icon">🗑️</span>
            </div>        
        </div>
        <div className="modal-footer">
            <button className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-confirm" onClick={handleConfirmClick}>
              Create
            </button>
          </div>
        </div>
      ) : (
       
        <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">         
            <button className={ isSwapSelected ? "header-btn NonSelected-btn" : "header-btn Selected-btn"} onClick={() => setisSwapSelected(false)}>Modify<span className="edit-icon">✏️</span></button>
            <button className={ isSwapSelected ? "header-btn Selected-btn" : "header-btn NonSelected-btn"} onClick={() => setisSwapSelected(true)}>Swap<span className="swap-icon">🔄</span></button>
        </div>
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
              value={
                isCreateMode
                  ? selectedDate
                    ? selectedDate.toISOString().split("T")[0]
                    : selectedShift?.ava_shiftday || ""
                  : selectedShift?.ava_shiftday || ""
              }
              readOnly
              className="form-control"
            />
            </div>
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
                <input type="text" value="09:00 AM - 06:00 PM" readOnly />
            </div>
            <div className="form-row lunch-break-row">
                <label>Lunch break</label>
                <input type="text" readOnly/>
                <span className="delete-icon">🗑️</span>
            </div>        
        </div>
        <div className="modal-footer">
            <button className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-confirm" onClick={handleConfirmClick}>
              {isSwapSelected ? "Swap" : "Update"}
            </button>
          </div>
    </div>


      )}
    </div>
  );
};

export default ShiftModal;
