import { UserWithTokens } from "@/services/AuthServices/types";
import { WeekDaysEnum } from "@/shared/enum/WeekDaysEnum";
import { IdType } from "@/shared/interfaces/IdType";
import { IGoogleTokens } from "@/shared/interfaces/IGoogleTokens";
import { IExerciseHistory } from "@/shared/models/IExerciseHistory";
import { IGroupPermissions, PermissionNode } from "@/shared/models/IGroup";
import { Realm } from "@realm/react";

// Esquema Academy
export class AcademyLocal extends Realm.Object<AcademyLocal> {
  id!: string;
  name!: string;
  location!: string;
  phoneNumber!: string;
  imagePath?: string;
  userLimit!: number;
  createdAt!: Date;
  updatedAt!: Date;
  isDeleted!: boolean;

  static schema = {
    name: "Academy",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string",
      location: "string",
      phoneNumber: "string",
      imagePath: "string?",
      userLimit: "int",
      createdAt: "date",
      updatedAt: "date",
      isDeleted: "bool",
    },
  };
}

// Esquema Training
export class TrainingLocal extends Realm.Object<TrainingLocal> {
  id!: string;
  name!: string;
  imagePath?: string;
  academyId!: string;
  exerciseType!: string; // TrainingTypeEnum
  createdAt!: Date;
  updatedAt!: Date;
  isDeleted!: boolean;

  static schema = {
    name: "Training",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string",
      imagePath: "string?",
      academyId: "string",
      exerciseType: "string", // Enums são armazenados como strings
      createdAt: "date",
      updatedAt: "date",
      isDeleted: "bool",
    },
  };
}

// Esquema Exercise
export class ExerciseLocal extends Realm.Object<ExerciseLocal> {
  id!: string;
  name!: string; // unique
  academyId!: string; // IdType, points to academy collection
  trainingIds!: string[]; // IdType[]
  description?: string;
  imagePath?: string;
  videoPath?: string;

  hasStopwatch?: boolean;
  hasGps?: boolean;

  // cardio
  distance?: number;
  distanceUnit?: string; // DistanceUnitEnum (e.g., kilometers, miles)

  // bodybuilding | mobility | stretching
  clientWeight?: number;
  repetitions?: number[];
  sets?: number;

  // all types
  exerciseOrientations?: string;
  restTimeBetweenSets?: number;
  duration?: number;
  goal?: string;
  isDeleted!: boolean;
  userNotes?: string;
  completed?: boolean;

  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: "Exercise",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string", // unique constraint should be handled at application level
      academyId: "string",
      trainingIds: "string[]",
      description: "string?",
      imagePath: "string?",
      videoPath: "string?",
      hasStopwatch: "bool?",
      hasGps: "bool?",
      distance: "float?",
      distanceUnit: "string?",
      clientWeight: "float?",
      repetitions: "int[]",
      sets: "int?",
      exerciseOrientations: "string?",
      restTimeBetweenSets: "int?",
      duration: "int?",
      goal: "string?",
      userNotes: "string?",
      completed: "bool?",
      createdAt: "date",
      updatedAt: "date",
      isDeleted: "bool",
    },
  };
}

export class ExerciseHistoryLocal extends Realm.Object<IExerciseHistory> {
  id!: string;

  // Relações
  userId!: string;
  academyId!: string;
  exerciseId!: string;

  // Dados gerais do treino
  completedAt!: Date;
  duration!: number;
  notes?: string;

  // Para exercícios de musculação/mobilidade/alongamento
  completedSets?: number;
  completedRepetitions?: number[];
  weightUsed?: number;

  // Para exercícios cardio (corrida, etc.)
  distance?: number;
  distanceUnit?: string; // DistanceUnitEnum
  pace?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;

  // Dados de GPS para corrida
  startLocation?: {
    latitude: number;
    longitude: number;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
  };
  routePoints?: Realm.List<LocationObjectCoords>;

  paceAverage?: string;
  speedAverage?: number;

  // Dados de progresso
  perceivedEffort?: number;
  feelingScore?: number;

  // Status do exercício
  completed!: boolean;
  partiallyCompleted?: boolean;

  // IDefaultEntityProperties
  createdAt!: Date;
  updatedAt?: Date;
  isDeleted?: boolean;

  static schema = {
    name: "ExerciseHistory",
    primaryKey: "id",
    properties: {
      id: "string",
      userId: "string",
      academyId: "string",
      exerciseId: "string",
      completedAt: "date",
      duration: "int",
      notes: "string?",
      completedSets: "int?",
      completedRepetitions: "int[]",
      weightUsed: "float?",
      distance: "float?",
      distanceUnit: "string?",
      pace: "float?",
      averageHeartRate: "int?",
      maxHeartRate: "int?",
      startLocation: "mixed?",
      endLocation: "mixed?",
      routePoints: "LocationObjectCoords[]",
      paceAverage: "string?",
      speedAverage: "float?",
      perceivedEffort: "int?",
      feelingScore: "int?",
      completed: "bool",
      partiallyCompleted: "bool?",
      createdAt: "date",
      updatedAt: "date?",
      isDeleted: "bool?",
    },
  };
}

// Esquema PaymentInfo
export class PaymentInfoLocal extends Realm.Object<PaymentInfoLocal> {
  id!: string;
  academyId!: string;
  userId?: string;
  monthlyFee!: number;
  checkingAccount!: string;
  cardHolderName!: string;
  cardNumber!: string;
  expirationDate!: string;
  cvv!: string;
  isFree!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  isDeleted!: boolean;

  static schema = {
    name: "PaymentInfo",
    primaryKey: "id",
    properties: {
      id: "string",
      academyId: "string",
      userId: "string?",
      monthlyFee: "float",
      checkingAccount: "string",
      cardHolderName: "string",
      cardNumber: "string",
      expirationDate: "string",
      cvv: "string",
      isFree: "bool",
      createdAt: "date",
      updatedAt: "date",
      isDeleted: "bool",
    },
  };
}

// Esquema User
export class UserLocal extends Realm.Object<UserWithTokens> {
  id!: string;
  name!: string;
  email!: string;
  isAdmin!: boolean;
  profilePhoto?: string;
  phoneNumber?: string;
  groupIds!: string[];
  cpf?: string;
  token?: string;
  googleTokens?: IGoogleTokens;
  isFree!: boolean;
  academyId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  isDeleted!: boolean;

  static schema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string",
      email: "string",
      isAdmin: "bool",
      profilePhoto: "string?",
      phoneNumber: "string?",
      groupIds: "string[]",
      cpf: "string?",
      token: "string",
      googleTokens: "mixed",
      academyId: "string",
      isFree: "bool",
      createdAt: "date",
      updatedAt: "date",
      isDeleted: "bool",
    },
  };
}

export class GroupLocal extends Realm.Object<GroupLocal> {
  id!: string;
  name!: string;
  academyId!: string;
  permissions!: IGroupPermissions;

  createdAt!: Date;
  updatedAt!: Date;
  isDeleted!: boolean;

  static schema = {
    name: "Group",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string",
      academyId: "string",
      permissions: "mixed", // Complex nested object
      createdAt: "date",
      updatedAt: "date",
      isDeleted: "bool",
    },
  };
}

export class TrainingByUserLocal extends Realm.Object<TrainingByUserLocal> {
  id!: IdType;
  userId!: IdType;
  academyId!: IdType;
  trainingId!: IdType;
  weekDays?: WeekDaysEnum[];
  completed?: boolean;
  isDeleted!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: "TrainingByUser",
    primaryKey: "id",
    properties: {
      id: "string",
      userId: "string",
      academyId: "string",
      trainingId: "string",
      weekDays: "int[]",
      completed: "bool?",
      isDeleted: "bool",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

export class LocationObjectCoords extends Realm.Object<LocationObjectCoords> {
  latitude!: number;
  longitude!: number;
  altitude!: number | null;
  accuracy!: number | null;
  altitudeAccuracy!: number | null;
  heading!: number | null;
  speed!: number | null;

  static schema = {
    name: "LocationObjectCoords",
    embedded: true,
    properties: {
      latitude: "double",
      longitude: "double",
      altitude: "double?",
      accuracy: "double?",
      altitudeAccuracy: "double?",
      heading: "double?",
      speed: "double?",
    },
  };
}
export class GpsMetricsTempLocal extends Realm.Object<GpsMetricsTempLocal> {
  id!: IdType;
  academyId!: IdType;
  exerciseId!: IdType;
  speedAverage!: number;
  raceFinalized?: boolean;
  distance!: number;
  pace!: string;
  elapsedTime!: number;
  startLocation!: LocationObjectCoords | null;
  endLocation!: LocationObjectCoords | null;
  routePoints!: Realm.List<LocationObjectCoords>;
  timestamp!: number;
  isDeleted!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: "GpsMetricsTemp",
    primaryKey: "id",
    properties: {
      id: "string",
      exerciseId: "string",
      academyId: "string",
      speedAverage: "float",
      raceFinalized: "bool?",
      distance: "float",
      pace: "string",
      elapsedTime: "int",
      startLocation: "LocationObjectCoords?",
      endLocation: "LocationObjectCoords?",
      routePoints: "LocationObjectCoords[]",
      timestamp: { type: "int" as const, default: Date.now },
      isDeleted: "bool",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

// Lista de todos os esquemas para configuração do Realm
export const schemas = [
  LocationObjectCoords,
  TrainingByUserLocal,
  AcademyLocal,
  TrainingLocal,
  ExerciseLocal,
  ExerciseHistoryLocal,
  GroupLocal,
  PaymentInfoLocal,
  UserLocal,
  GpsMetricsTempLocal,
];
