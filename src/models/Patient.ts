import { Group } from "./Group";

export type Patient = {
    display: string;
    id: string;
    group?: Group;
  };