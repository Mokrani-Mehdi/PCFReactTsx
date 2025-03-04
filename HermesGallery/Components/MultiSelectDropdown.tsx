import * as React from "react";
import { useState, useEffect } from "react";
import { Shift } from "./Models/DisplayReactComponentModels";

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

  useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        // Reset fields for create mode
        setSelectedDepartment("");
        setSelectedSkill("");
        setOriginalDepartment("");
        setOriginalSkill("");
      } else if (selectedShift) {
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
          (skill) => skill.SkillId === selectedSkill
        )
      : null;
    
    if (isCreateMode && selectedDate && onCreateShift) {
      // Create a new shift
      const newShift: Shift = {
        ava_planningdetailsid: `new-${Date.now()}`, // Temporary ID
        ava_shiftday: selectedDate.toISOString().split('T')[0],
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {isCreateMode ? "Create New Shift" : "Update Shift"}
        </div>
        <div className="form-group">
          <label className="form-label">Staff member</label>
          <input
            type="text"
            value={selectedWorker || ""}
            readOnly
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="text"
            value={isCreateMode 
              ? (selectedDate ? selectedDate.toISOString().split('T')[0] : "") 
              : (selectedShift?.ava_shiftday || "")}
            readOnly
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
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
        <div className="form-group">
          <label className="form-label">Skill</label>
          <select
            className="form-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            disabled={!selectedDepartment}
          >
            <option value="">Select Skill</option>
            {getSkillsForDepartment(selectedDepartment).map((skill) => (
              <option key={skill.SkillId} value={skill.SkillId}>
                {skill.Name}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-confirm" onClick={handleConfirmClick}>
            {isCreateMode ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;