import * as React from "react";
import { useState, useEffect, useRef } from "react";
import "./DisplayReactComponent.css";
import { Shift } from "./Models/DisplayReactComponentModels";
import { IWorkforceDisplayProps } from "./Interfaces/DisplayReactComponentInterface";
import Select from "react-select";
import ShiftModal from "./Components/ModalPopUp"; // Import the new ShiftModal component

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
  const [FirstWorkforceData, setFirstLocalWorkforceData] = useState(workforceData);
  const [DepartementData, setDepartementData] = useState(
    workforceData?.departmentSkillsLists
  );

  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [updatedShifts, setUpdatedShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [DepartmentDropDownSelected, SetDepartmentDropDownSelected] = useState<string>("");
  const [SkillDropDownSelected, SetSkillDropDownSelected] = useState<string>("");
  
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

      return nameMatches && departmentMatches;
      
    }).sort((a, b) => a.ava_name.localeCompare(b.ava_name));
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
  };
  
  useEffect(() => {
    if (maxShifts > 0) {
      document.documentElement.style.setProperty(
        "--num-days",
        maxShifts.toString()
      );
    }
  }, [maxShifts]);

  const handleOnClear = () => {
    setLocalWorkforceData(workforceData);
    setFirstLocalWorkforceData(workforceData);
    setUpdatedShifts([]);
  };

  const handleShiftUpdate = (updatedShift: Shift) => {
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
            shift.ava_planningdetailsid === updatedShift.ava_planningdetailsid
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

    setIsPopupOpen(false);
  };

  if (!isValidData) {
    return <EmptyStateMessage />;
  }

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
      
      {/* Using the new ShiftModal component */}
      <ShiftModal
        isOpen={isPopupOpen}
        selectedWorker={selectedWorker}
        selectedShift={selectedShift}
        departmentData={DepartementData}
        onClose={handleClosePopup}
        onConfirm={handleShiftUpdate}
      />
    </div>
  );
};

export default WorkforceDisplay;