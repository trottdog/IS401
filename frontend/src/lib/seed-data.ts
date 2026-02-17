import type { Building, Category, Club, Event, ClubMembership, Announcement } from "./types";

export const BUILDINGS: Building[] = [
  { id: "b1", name: "Talmage Building", abbreviation: "TMCB", latitude: 40.2497, longitude: -111.6494, address: "756 E University Pkwy" },
  { id: "b2", name: "Wilkinson Student Center", abbreviation: "WSC", latitude: 40.2519, longitude: -111.6493, address: "1060 N 1200 E" },
  { id: "b3", name: "Harold B. Lee Library", abbreviation: "HBLL", latitude: 40.2488, longitude: -111.6494, address: "2060 Harold B. Lee Library" },
  { id: "b4", name: "Smith Fieldhouse", abbreviation: "SFH", latitude: 40.2531, longitude: -111.6458, address: "269 Student Athlete Building" },
  { id: "b5", name: "Benson Building", abbreviation: "BNSN", latitude: 40.2505, longitude: -111.6512, address: "754 E University Pkwy" },
  { id: "b6", name: "Joseph Smith Building", abbreviation: "JSB", latitude: 40.2502, longitude: -111.6475, address: "270 JSB" },
  { id: "b7", name: "Marriott Center", abbreviation: "MC", latitude: 40.2533, longitude: -111.6483, address: "Marriott Center" },
  { id: "b8", name: "Harris Fine Arts Center", abbreviation: "HFAC", latitude: 40.2504, longitude: -111.6525, address: "Harris Fine Arts Center" },
  { id: "b9", name: "Engineering Building", abbreviation: "EB", latitude: 40.2475, longitude: -111.6469, address: "450 Engineering Building" },
  { id: "b10", name: "Crabtree Technology Building", abbreviation: "CTB", latitude: 40.2470, longitude: -111.6485, address: "Crabtree Technology Building" },
];

export const CATEGORIES: Category[] = [
  { id: "c1", name: "Academic", icon: "school" },
  { id: "c2", name: "Social", icon: "people" },
  { id: "c3", name: "Sports", icon: "fitness-center" },
  { id: "c4", name: "Arts", icon: "palette" },
  { id: "c5", name: "Service", icon: "volunteer-activism" },
  { id: "c6", name: "Career", icon: "work" },
  { id: "c7", name: "Tech", icon: "computer" },
  { id: "c8", name: "Music", icon: "music-note" },
  { id: "c9", name: "Outdoors", icon: "terrain" },
  { id: "c10", name: "Cultural", icon: "public" },
];

export const CLUBS: Club[] = [
  { id: "cl1", name: "BYU Developers", description: "A community for software developers and aspiring engineers.", categoryId: "c7", memberCount: 245, imageColor: "#0062B8", contactEmail: "devs@byu.edu", website: "byudevs.com", instagram: "@byudevs" },
  { id: "cl2", name: "Cougar Outdoors", description: "Explore Utah's wilderness with fellow Cougars.", categoryId: "c9", memberCount: 389, imageColor: "#10B981", contactEmail: "outdoors@byu.edu", website: "cougaroutdoors.byu.edu", instagram: "@cougaroutdoors" },
  { id: "cl3", name: "BYU Dance Company", description: "Premier student dance organization.", categoryId: "c4", memberCount: 67, imageColor: "#EC4899", contactEmail: "dance@byu.edu", website: "byudance.com", instagram: "@byudance" },
  { id: "cl4", name: "Entrepreneurship Club", description: "Pitch nights, mentors, startup resources.", categoryId: "c6", memberCount: 178, imageColor: "#F59E0B", contactEmail: "eclub@byu.edu", website: "byuentrepreneurs.com", instagram: "@byueclub" },
  { id: "cl5", name: "Cougar Soccer Club", description: "Recreational and competitive soccer.", categoryId: "c3", memberCount: 156, imageColor: "#EF4444", contactEmail: "soccer@byu.edu", website: "", instagram: "@byusoccer" },
  { id: "cl6", name: "International Students Association", description: "Cultural events and community for international students.", categoryId: "c10", memberCount: 312, imageColor: "#8B5CF6", contactEmail: "isa@byu.edu", website: "byuisa.org", instagram: "@byuisa" },
  { id: "cl7", name: "BYU Volunteer Corps", description: "Service projects and mentoring.", categoryId: "c5", memberCount: 523, imageColor: "#14B8A6", contactEmail: "volunteer@byu.edu", website: "byuvolunteer.org", instagram: "@byuvolunteer" },
  { id: "cl8", name: "Pre-Med Society", description: "MCAT prep and med school resources.", categoryId: "c1", memberCount: 201, imageColor: "#0EA5E9", contactEmail: "premed@byu.edu", website: "byupremed.org", instagram: "@byupremed" },
  { id: "cl9", name: "BYU Photography Club", description: "Workshops and photo walks.", categoryId: "c4", memberCount: 134, imageColor: "#6366F1", contactEmail: "photo@byu.edu", website: "", instagram: "@byuphoto" },
  { id: "cl10", name: "Cougar Board Games", description: "Board game nights and tournaments.", categoryId: "c2", memberCount: 98, imageColor: "#D97706", contactEmail: "games@byu.edu", website: "", instagram: "@byugames" },
  { id: "cl11", name: "BYU A Cappella", description: "Student a cappella groups.", categoryId: "c8", memberCount: 45, imageColor: "#E11D48", contactEmail: "acappella@byu.edu", website: "byuacappella.com", instagram: "@byuacappella" },
  { id: "cl12", name: "Data Science Club", description: "ML, Kaggle, industry speakers.", categoryId: "c7", memberCount: 167, imageColor: "#7C3AED", contactEmail: "datasci@byu.edu", website: "byudatasci.com", instagram: "@byudatasci" },
];

function generateEvents(): Event[] {
  const now = new Date();
  const events: Event[] = [];
  const eventDefs: Array<{
    title: string;
    description: string;
    clubId: string;
    buildingId: string;
    categoryId: string;
    room: string;
    offsetHours: number;
    durationHours: number;
    hasLimitedCapacity: boolean;
    maxCapacity: number | null;
    hasFood: boolean;
    foodDescription: string | null;
    tags: string[];
  }> = [
    { title: "Intro to React Workshop", description: "Learn React.js with hands-on exercises.", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "185", offsetHours: -0.5, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 40, hasFood: false, foodDescription: null, tags: ["workshop", "coding"] },
    { title: "Sunset Hike at Y Mountain", description: "Scenic evening hike. Bring water.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Lobby", offsetHours: 3, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["hiking"] },
    { title: "Startup Pitch Night", description: "Student entrepreneurs pitch to investors.", clubId: "cl4", buildingId: "b2", categoryId: "c6", room: "Varsity Theater", offsetHours: 8, durationHours: 2.5, hasLimitedCapacity: true, maxCapacity: 100, hasFood: true, foodDescription: "Pizza", tags: ["pitch"] },
    { title: "Pick-up Soccer", description: "Weekly pickup game. All levels welcome.", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "Fields", offsetHours: 24, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["soccer"] },
    { title: "Board Game Tournament", description: "Settlers of Catan with prizes.", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "312", offsetHours: 26, durationHours: 4, hasLimitedCapacity: true, maxCapacity: 32, hasFood: true, foodDescription: "Snacks", tags: ["games"] },
    { title: "Machine Learning Workshop", description: "Neural networks with PyTorch.", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 102", offsetHours: 4, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 30, hasFood: false, foodDescription: null, tags: ["AI"] },
  ];
  eventDefs.forEach((def, i) => {
    const start = new Date(now.getTime() + def.offsetHours * 60 * 60 * 1000);
    const end = new Date(start.getTime() + def.durationHours * 60 * 60 * 1000);
    const reservations = def.hasLimitedCapacity && def.maxCapacity ? Math.floor(Math.random() * def.maxCapacity * 0.5) : 0;
    events.push({
      id: `e${i + 1}`,
      title: def.title,
      description: def.description,
      clubId: def.clubId,
      buildingId: def.buildingId,
      categoryId: def.categoryId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      room: def.room,
      hasLimitedCapacity: def.hasLimitedCapacity,
      maxCapacity: def.maxCapacity,
      currentReservations: reservations,
      hasFood: def.hasFood,
      foodDescription: def.foodDescription,
      tags: def.tags,
      isCancelled: false,
    });
  });
  return events;
}

export const EVENTS = generateEvents();

export const DEFAULT_MEMBERSHIPS: ClubMembership[] = [
  { id: "m1", userId: "user1", clubId: "cl1", role: "admin", joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m2", userId: "user1", clubId: "cl2", role: "member", joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", clubId: "cl1", title: "Hackathon Registration Open", body: "Sign up on our website.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

export const DEFAULT_USER = {
  id: "user1",
  email: "student@byu.edu",
  name: "Alex Johnson",
  password: "password123",
  createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
};
