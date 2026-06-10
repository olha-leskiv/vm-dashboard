import type { User } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "usr-001",
    name: "Alice Chen",
    email: "alice@ascendra.dev",
    role: "engineer",
    vmCount: 3,
  },
  {
    id: "usr-002",
    name: "Bob Marquez",
    email: "bob@ascendra.dev",
    role: "engineer",
    vmCount: 2,
  },
  {
    id: "usr-003",
    name: "Carol Singh",
    email: "carol@ascendra.dev",
    role: "admin",
    vmCount: 1,
  },
];

export const CURRENT_USER_ID = "usr-001";
