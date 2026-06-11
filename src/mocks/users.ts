import type { User } from "@/types";

const FIRST_NAMES = [
  "Alice", "Bob", "Carlos", "Diana", "Ethan", "Fiona", "George", "Hannah",
  "Ivan", "Julia", "Kevin", "Laura", "Michael", "Nina", "Oscar", "Priya",
  "Quinn", "Rachel", "Stefan", "Tina", "Uma", "Victor", "Wendy", "Xavier",
  "Yuki", "Zara", "Aaron", "Bianca", "Chris", "Delia", "Erik", "Fatima",
  "Gavin", "Hana", "Igor", "Jess", "Kai", "Lena", "Marco", "Nadia",
  "Owen", "Petra", "Ravi", "Sara", "Theo", "Vera", "Will", "Xiu",
  "Yael", "Zaid",
];

const LAST_NAMES = [
  "Chen", "Marquez", "Singh", "Kim", "Patel", "Johnson", "Williams", "Brown",
  "Garcia", "Martinez", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson",
  "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Robinson", "Clark",
  "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez",
  "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
  "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell",
  "Parker", "Evans",
];

const DOMAINS = ["acme.dev", "techcorp.io", "buildco.com", "devteam.org", "codehaus.net"];

function pad(n: number, digits = 3): string {
  return String(n).padStart(digits, "0");
}

function genUsers(): User[] {
  const users: User[] = [];
  for (let i = 0; i < 112; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    // Every 14th user is an admin, rest are engineers
    const role: User["role"] = i % 14 === 0 ? "admin" : "engineer";
    // 33 users (i%3===0 && i<99) get vmCount=3; remaining 79 get vmCount=2 → total 257
    const vmCount = i % 3 === 0 && i < 99 ? 3 : 2;
    const domain = DOMAINS[i % DOMAINS.length];
    users.push({
      id: `usr-${pad(i + 1)}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
      role,
      vmCount,
    });
  }
  return users;
}

export const MOCK_USERS = genUsers();

export const CURRENT_USER_ID = "usr-001";
