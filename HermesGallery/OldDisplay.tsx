import * as React from "react";
import { useState, useEffect, useRef } from "react";
import "./DisplayReactComponent.css";
import { Shift } from "./Models/DisplayReactComponentModels";
import { IWorkforceDisplayProps } from "./Interfaces/DisplayReactComponentInterface";
import Select from "react-select";
const EmptyStateMessage = () => (
  <div className="empty-state flex flex-col items-center justify-center p-8 text-center">
    <h3 className="text-lg font-medium text-gray-700 mb-2">
      No Data Available
    </h3>
    <p className="text-sm text-gray-500">
      There are currently no workforce records to display.
    </p>
  </div>
);
const getDatesInRange = (startDate: string, endDate: string): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: Date[] = [];

  let currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
export const WorkforceDisplay: React.FC<IWorkforceDisplayProps> = ({
  workforceData,
  onWorkerSelect,
  onShiftSelect,
  notifyOutputChanged,
  onPayloadUpdate,
  onValidate,
}) => {
  const [localWorkforceData, setLocalWorkforceData] = useState(workforceData);
  const [FirstWorkforceData, setFirstLocalWorkforceData] =
    useState(workforceData);
  const [DepartementData, setDepartementData] = useState(
    workforceData?.departmentSkillsLists
  );

  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [updatedShifts, setUpdatedShifts] = useState<Shift[]>([]);
  const [originalDepartment, setOriginalDepartment] = useState<string>("");
  const [originalSkill, setOriginalSkill] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [DepartmentDropDownSelected, SetDepartmentDropDownSelected] =
    useState<string>("");
  const [SkillDropDownSelected, SetSkillDropDownSelected] =
    useState<string>("");
  const isPayloadChange = useRef(false);
  const isValidData = React.useMemo(() => {
    return (
      localWorkforceData?.workforces?.length > 0 &&
      localWorkforceData?.departmentSkillsLists?.length > 0
    );
  }, [localWorkforceData]);
  useEffect(() => {
    const currentDataStr = JSON.stringify(FirstWorkforceData);
    const newDataStr = JSON.stringify(workforceData);

    if (currentDataStr !== newDataStr) {
      isPayloadChange.current = true;
      setLocalWorkforceData(workforceData);
      setFirstLocalWorkforceData(workforceData);
      setDepartementData(workforceData?.departmentSkillsLists);
      setUpdatedShifts([]);
      setSelectedWorker(null);
      setSelectedShift(null);
      setIsPopupOpen(false);
      setSelectedDepartment("");
      setSelectedSkill("");
      setOriginalDepartment("");
      setOriginalSkill("");
      setSearchQuery("");
      SetDepartmentDropDownSelected("");
      SetSkillDropDownSelected("");
    }
  }, [workforceData]);
  const datesInRange =
    localWorkforceData?.planningSchedule != null
      ? getDatesInRange(
          localWorkforceData.planningSchedule.ava_startdate,
          localWorkforceData.planningSchedule.ava_enddate
        )
      : [];

  const handleShiftClick = (workerId: string, shift: Shift | null) => {
    if (shift) {
      isPayloadChange.current = false;
      const currentShift = getUpdatedShift(workerId, shift);
      setSelectedShift(currentShift);
      setSelectedWorker(workerId);
      setIsPopupOpen(true);

      const department = DepartementData.find(
        (dept) =>
          dept.Departementid === currentShift.DepartmentId ||
          dept.HexColor === currentShift.ava_departmentcolor
      );
      if (department) {
        setSelectedDepartment(department.Departementid);
        setOriginalDepartment(department.Departementid);

        if (shift.SkillId) {
          setSelectedSkill(shift.SkillId);
          setOriginalSkill(shift.SkillId);
        } else {
          setSelectedSkill("");
          setOriginalSkill("");
        }
      }

      onShiftSelect?.(workerId, shift);
    }
  };
  const getUpdatedShift = (workerId: string, shiftToFind: Shift): Shift => {
    const updatedShift = updatedShifts.find(
      (shift) =>
        shift.ava_planningdetailsid === shiftToFind.ava_planningdetailsid
    );

    return updatedShift || shiftToFind;
  };
  const filteredWorkforces = React.useMemo(() => {
    if (!isValidData) return [];
    return localWorkforceData.workforces.filter((workforce) => {
      const nameMatches = workforce.ava_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

        const departmentMatches =
        selectedDepartments.length === 0 ||
        (workforce.Departments != null &&
          workforce.Departments.some((dept) =>
            selectedDepartments.includes(dept.Id)
          ));

      return (
        nameMatches && (departmentMatches )
      );
      
    }).sort((a, b) => a.ava_name.localeCompare(b.ava_name));;
  }, [
    localWorkforceData,
    searchQuery,
    isValidData,
    selectedDepartments,
    SkillDropDownSelected,
  ]);

  const handleOnValidate = () => {
    onValidate?.(updatedShifts);
  };
  const maxShifts = React.useMemo(() => {
    if (!isValidData || filteredWorkforces.length === 0) return 0;
    return Math.max(
      ...filteredWorkforces.map((person) => person.Shifts?.length || 0)
    );
  }, [filteredWorkforces, isValidData]);
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedDepartment("");
    setSelectedSkill("");
    setOriginalDepartment("");
    setOriginalSkill("");
  };
  useEffect(() => {
    if (maxShifts > 0) {
      document.documentElement.style.setProperty(
        "--num-days",
        maxShifts.toString()
      );
    }
  }, [maxShifts]);
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSelectedSkill("");
  };

  const handleOnClear = () => {
    setLocalWorkforceData(workforceData);
    setFirstLocalWorkforceData(workforceData);
    setUpdatedShifts([]);
  };

  const getSkillsForDepartment = (departmentId: string) => {
    const department = DepartementData.find(
      (dept) => dept.Departementid === departmentId
    );
    return department?.Skills || [];
  };

  const isShiftModified = (): boolean => {
    const departmentChanged = selectedDepartment !== originalDepartment;
    const skillChanged = selectedSkill !== originalSkill;
    return departmentChanged || skillChanged;
  };
  const handleConfirm = () => {
    if (!selectedShift || !selectedWorker || !selectedDepartment) return;

    if (!isShiftModified()) {
      handleClosePopup();
      return;
    }
    DepartementData;
    const selectedDepartmentData = DepartementData.find(
      (dept) => dept.Departementid === selectedDepartment
    );

    if (!selectedDepartmentData) return;
    const selectedSkillData = selectedSkill
      ? selectedDepartmentData.Skills.find(
          (skill) => skill.SkillId === selectedSkill
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

    setUpdatedShifts((prev) => {
      const existingIndex = prev.findIndex(
        (shift) =>
          shift.ava_planningdetailsid === updatedShift.ava_planningdetailsid
      );
      if (existingIndex >= 0) {
        const newShifts = [...prev];
        newShifts[existingIndex] = updatedShift;
        return newShifts;
      }
      return [...prev, updatedShift];
    });

    const updatedWorkforces = localWorkforceData.workforces.map((workforce) => {
      if (workforce.ava_name === selectedWorker) {
        return {
          ...workforce,
          Shifts: workforce.Shifts.map((shift) =>
            shift.ava_planningdetailsid === selectedShift.ava_planningdetailsid
              ? updatedShift
              : shift
          ),
        };
      }
      return workforce;
    });

    setLocalWorkforceData({
      ...localWorkforceData,
      workforces: updatedWorkforces,
    });

    handleClosePopup();
  };

  if (!isValidData) {
    return <EmptyStateMessage />;
  }

  const handleDropDownSelection = () => {};
  return (
    <div className="scrollable-table-wrapper">
     
      <div className="header-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        {/*<div className="material-multi-select">
<div className="selected-items">
<div>
 {DepartementData.map( e => <label><input type="checkbox" value={e.Departementid} /> {e.DepartmentName}</label>)}

</div>
</div>
        </div>*/}
        <div className="DropDown-Department-container">
        <Select className="material-dropdown"
  options={DepartementData.map((dept) => ({
    value: dept.Departementid,
    label: dept.DepartmentName,
  }))}
  isMulti
  value={DepartementData.filter((dept) =>
    selectedDepartments.includes(dept.Departementid)
  ).map((dept) => ({
    value: dept.Departementid,
    label: dept.DepartmentName,
  }))}
  onChange={(selectedOptions) => {
    setSelectedDepartments(selectedOptions.map((option) => option.value));
  }}
/>
         
        </div>
        <div className="clear-button-container">
          <button className="clear-button" onClick={handleOnClear}>
            Clear
          </button>
        </div>
        <div className="validate-button-container">
          <button className="validate-button" onClick={handleOnValidate}>
            Validate
          </button>
        </div>
      </div>
      {filteredWorkforces.length > 0 ? (
        <table className="workforce-table">
          <thead className="StaffHeader">
            <tr>
              <th></th>
              {datesInRange.map((date, index) => (
                <th
                  key={index}
                  className={
                    date.toLocaleDateString("en-US", { weekday: "long" }) ===
                    "Sunday"
                      ? "divider"
                      : ""
                  }
                >
                  <div>
                    {date
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .substring(0, 3)}
                  </div>
                  <div>{date.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredWorkforces.map((person) => (
              <tr key={person.ava_workforceid}>
                <td
                  style={{
                    fontWeight: person?.isManager ? "bold" : "normal",
                  }}
                >
                  {person.ava_name}
                </td>
                {datesInRange.map((date, index) => {
                  const shift = person.Shifts?.find(
                    (s) =>
                      new Date(s.ava_shiftday || "").getDate() ===
                      date.getDate()
                  );
                  return (
                    <td
                      key={index}
                      className={
                        date.toLocaleDateString("en-US", {
                          weekday: "long",
                        }) === "Sunday"
                          ? "divider"
                          : ""
                      }
                    >
                      <div className="cell-container">
                        <div className="tooltip">
                          <button
                            className="shift-button"
                            style={{
                              backgroundColor:
                                shift?.ava_departmentcolor || "#696969",
                            }}
                            onClick={() =>
                              handleShiftClick(person.ava_name, shift || null)
                            }
                          >
                            {shift?.ava_isassigned
                              ? `${shift.ava_SpecificScheduleName || "E"}`
                              : ""}
                          </button>
                          {shift && (
                            <span className="tooltiptext">
                              {shift.ava_isassigned
                                ? `${shift.ava_shiftday || "Unknown Day"}
                          ${person.ava_name}
                          ${shift.DepartmentName}
                          ${shift.SkillName}
                          Lunch Break: ${shift.ava_lunchtimeStart} - ${
                                    shift.ava_lunchtimeEnd
                                  }
                          Schedule: ${shift.ava_SpecificScheduleStart} - ${
                                    shift.ava_SpecificScheduleEnd
                                  }`
                                : `${
                                    shift.ava_absencereasonName ||
                                    "Unknown Break"
                                  }`}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results text-center p-4 text-gray-600">
          <span>No staff members found matching your search.</span>
        </div>
      )}
      {isPopupOpen && (
        <div className="modal-overlay" onClick={handleClosePopup}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Shift Details</div>
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
                value={selectedShift?.ava_shiftday || ""}
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
                {DepartementData.map((dept) => (
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
              <button className="btn btn-cancel" onClick={handleClosePopup}>
                Cancel
              </button>
              <button className="btn btn-confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkforceDisplay;