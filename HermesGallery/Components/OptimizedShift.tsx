import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Shift, Department, Skill } from "../Models/DisplayReactComponentModels";

interface ShiftModalProps {
  isOpen: boolean;
  selectedWorker: string | null;
  selectedShift: Shift | null;
  departmentData: Department[];
  isCreateMode: boolean;
  selectedDate?: Date | null;
  onClose: () => void;
  onConfirm: (updatedShift: Shift) => void;
  onCreateShift?: (newShift: Shift) => void;
}

const ShiftModalOptimized: React.FC<ShiftModalProps> = React.memo(({
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

  useEffect(() => {
    console.log("Modal props changed:", { 
      isOpen, 
      selectedWorker, 
      selectedShift,
      isCreateMode 
    });
  }, [isOpen, selectedWorker, selectedShift, isCreateMode]);

  // Memoize department data lookup
  const departmentLookup = useMemo(() => {
    return departmentData.reduce((acc, dept) => {
      acc[dept.Departementid] = dept;
      return acc;
    }, {} as Record<string, Department>);
  }, [departmentData]);

  useEffect(() => {
    if (!isOpen) return;

    if (isCreateMode) {
      const isDeleted = selectedShift?.isDeleted;
      setIsRecreatingShift(!!isDeleted);
      setSelectedDepartment("");
      setSelectedSkill("");
      setOriginalDepartment("");
      setOriginalSkill("");
    } else if (selectedShift) {
      setIsRecreatingShift(false);
      const department = departmentLookup[selectedShift.DepartmentId || ""] || 
                        departmentData.find(dept => dept.HexColor === selectedShift.ava_departmentcolor);
      
      if (department) {
        setSelectedDepartment(department.Departementid);
        setOriginalDepartment(department.Departementid);
        setSelectedSkill(selectedShift.SkillId || "");
        setOriginalSkill(selectedShift.SkillId || "");
      }
    }
  }, [isOpen, selectedWorker, selectedShift, isCreateMode,departmentLookup]);

  const getSkillsForDepartment = useCallback((departmentId: string): Skill[] => {
    return departmentLookup[departmentId]?.Skills || [];
  }, [departmentLookup]);

  const isShiftModified = useCallback((): boolean => {
    if (isCreateMode) return true;
    return selectedDepartment !== originalDepartment || selectedSkill !== originalSkill;
  }, [isCreateMode, selectedDepartment, originalDepartment, selectedSkill, originalSkill]);

  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSelectedSkill("");
  }, []);

  const handleConfirmClick = useCallback(() => {
    if (!selectedWorker || !selectedDepartment) return;

    if (!isCreateMode && !isShiftModified()) {
      onClose();
      return;
    }

    const selectedDepartmentData = departmentLookup[selectedDepartment];
    if (!selectedDepartmentData) return;
    
    const selectedSkillData = selectedSkill
      ? selectedDepartmentData.Skills.find(skill => skill.SkillId === selectedSkill)
      : null;

    if (isCreateMode && onCreateShift) {
      const shiftDate = selectedDate || 
        (selectedShift?.ava_shiftday ? new Date(selectedShift.ava_shiftday) : new Date());

      const newShift: Shift = {
        ava_planningdetailsid: isRecreatingShift && selectedShift
          ? selectedShift.ava_planningdetailsid
          : `new-${Date.now()}`,
        ava_shiftday: shiftDate.toISOString().split('T')[0],
        ava_departmentcolor: selectedDepartmentData.HexColor,
        DepartmentId: selectedDepartment,
        SkillId: selectedSkill || undefined,
        SkillName: selectedSkillData?.Name,
        DepartmentName: selectedDepartmentData.DepartmentName,
        ava_isassigned: true,
        ava_SpecificScheduleName: "E",
        ava_SpecificScheduleStart: "09:00",
        ava_SpecificScheduleEnd: "17:00",
        ava_lunchtimeStart: "12:00",
        ava_lunchtimeEnd: "13:00",
        isEdited: true,
        isDeleted: false,
        isSwap: false
      };
      
      onCreateShift(newShift);
    } else if (!isCreateMode && selectedShift) {
      const updatedShift: Shift = {
        ...selectedShift,
        ava_departmentcolor: selectedDepartmentData.HexColor,
        DepartmentId: selectedDepartment,
        SkillId: selectedSkill || undefined,
        SkillName: selectedSkillData?.Name,
        DepartmentName: selectedDepartmentData.DepartmentName,
        isEdited: true
      };

      onConfirm(updatedShift);
    }
  }, [
    selectedWorker,
    selectedDepartment,
    isCreateMode,
    isShiftModified,
    departmentLookup,
    selectedSkill,
    selectedDate,
    selectedShift,
    isRecreatingShift,
    onCreateShift,
    onConfirm,
    onClose
  ]);

  const modalTitle = useMemo(() => 
    isRecreatingShift 
      ? "Recreate Shift" 
      : (isCreateMode ? "Create New Shift" : "Update Shift"),
    [isRecreatingShift, isCreateMode]
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">{modalTitle}</div>
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
              ? (selectedDate 
                 ? selectedDate.toISOString().split('T')[0] 
                 : (selectedShift?.ava_shiftday || ""))
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
          <button 
            className="btn btn-confirm" 
            onClick={handleConfirmClick}
            disabled={!selectedDepartment}
          >
            {isRecreatingShift ? "Recreate" : (isCreateMode ? "Create" : "Update")}
          </button>
        </div>
      </div>
    </div>
  );
});

ShiftModalOptimized.displayName = 'ShiftModalOptimized';

export default ShiftModalOptimized;