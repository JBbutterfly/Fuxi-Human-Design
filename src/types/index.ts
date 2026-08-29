import type { Timestamp } from "firebase/firestore";

export type MembershipRole = "admin" | "member";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

export interface Community {
  id: string;
  name: string;
  createdBy: string; // uid
  createdAt: Timestamp;
  joinCode: string; // short, human-shareable, rotatable by an admin
}

export interface Membership {
  id: string; // `${communityId}_${uid}`
  communityId: string;
  uid: string;
  displayName: string; // denormalized for member list rendering
  role: MembershipRole;
  joinedAt: Timestamp;
}

export interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, local to the birth location
  location: string; // free-text place name shown to the user
  latitude: number;
  longitude: number;
  timezone: string; // IANA tz name, e.g. "America/Denver"
}

export interface Chart {
  id: string;
  ownerUid: string; // account that created/owns this chart
  subjectName: string; // person the chart is for (may differ from the account holder)
  birthData: BirthData;
  // Computed Human Design + astrology result, produced by the ported chart engine.
  // Left as unknown here on purpose: its shape is owned by the engine, not the app layer.
  result: unknown;
  createdAt: Timestamp;
}

// Published copy of a Chart, stored at communities/{communityId}/sharedCharts/{ownerUid}
// so other members of that community can read it without needing access to the owner's
// private `charts/{chartId}` doc. Written by the owner; see firestore.rules for why.
export interface SharedChart {
  chartId: string;
  ownerUid: string;
  subjectName: string;
  result: unknown;
  publishedAt: Timestamp;
}
