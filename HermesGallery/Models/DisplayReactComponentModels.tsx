export interface Department {
    DepartmentName: string;
    Departementid: string;
    HexColor: string;
    Skills: Skill[];
  }

  export interface Skill {
    Name: string;
    SkillId: string;
  }
  export interface DepartmentWorkforce {
    Name: string;
    Id: string;
   
  }
  
export interface Shift {
  ava_departmentcolor?: string;
  ava_isassigned?: boolean;
  ava_keyholderresponsabilitycode?: number | null;
  ava_name?: string;
  ava_planningdetailsid: string;
  ava_shiftday?: string;
  isDeleted: boolean;
  isEdited: boolean;
  isSwap: boolean;
  workforceId?: string;
  DepartmentId?: string;
  SkillId?: string;
  ava_absencereasonid? : string;
  ava_SpecificScheduleid?:string;
  SkillName?: string;
  DepartmentName?: string;
  ava_absencereasonName?: string;
  ava_lunchtimeName?: string;
  ava_lunchtimeStart?: string;
  ava_lunchtimeEnd?: string;
  ava_SpecificScheduleName?: string;
  ava_SpecificScheduleStart?: string;
  ava_SpecificScheduleEnd?: string;

}

export interface Workforce {
  ava_contractenddatecode: string | null;
  ava_contractstartdate: string | null;
  ava_isprofilcreated: boolean;
  ava_name: string;
  isManager : boolean;
  ava_rolecode?: number;
  ava_workforceid: string;
  statecode: number;
  Shifts: Shift[];
  Departments: DepartmentWorkforce[]; 
}


export interface PlanningSchedule {
  ava_startdate: string ;
  ava_enddate: string;
 
}

