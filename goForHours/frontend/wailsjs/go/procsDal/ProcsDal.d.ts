// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {procsDal} from '../models';
import {context} from '../models';

export function CloseDatabase():Promise<void>;

export function CreateOrLoadDatabase():Promise<void>;

export function GetAllTrackedProcess():Promise<Array<procsDal.TrackedProcess>>;

export function GetTrackedProcessImage(arg1:string):Promise<procsDal.TrackedProcessesImages>;

export function InsertNewTrackedProcess(arg1:procsDal.TrackedProcess):Promise<boolean>;

export function InsertOrUpdateNewTrackedProcessImage(arg1:string,arg2:string):Promise<boolean>;

export function OpenDatabase():Promise<void>;

export function SetContext(arg1:context.Context):Promise<void>;

export function StopTrackingProcess(arg1:string):Promise<boolean>;

export function UpdateTrackedProcessName(arg1:string,arg2:string):Promise<boolean>;
