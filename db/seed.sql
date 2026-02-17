-- BYUConnect seed data (run after schema.sql)
-- Usage: psql -U postgres -d byuconnect -f db/seed.sql
-- Or: psql $DATABASE_URL -f db/seed.sql

BEGIN;

-- Users
INSERT INTO users (id, email, name, password, created_at) VALUES
  ('user1', 'student@byu.edu', 'Alex Johnson', 'password123', NOW() - INTERVAL '120 days'),
  ('user2', 'jane@byu.edu', 'Jane Smith', 'password123', NOW() - INTERVAL '90 days'),
  ('user3', 'mike@byu.edu', 'Mike Chen', 'password123', NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- Buildings
INSERT INTO buildings (id, name, abbreviation, latitude, longitude, address) VALUES
  ('b1', 'Talmage Building', 'TMCB', 40.2497, -111.6494, '756 E University Pkwy'),
  ('b2', 'Wilkinson Student Center', 'WSC', 40.2519, -111.6493, '1060 N 1200 E'),
  ('b3', 'Harold B. Lee Library', 'HBLL', 40.2488, -111.6494, '2060 Harold B. Lee Library'),
  ('b4', 'Smith Fieldhouse', 'SFH', 40.2531, -111.6458, '269 Student Athlete Building'),
  ('b5', 'Benson Building', 'BNSN', 40.2505, -111.6512, '754 E University Pkwy'),
  ('b6', 'Joseph Smith Building', 'JSB', 40.2502, -111.6475, '270 JSB'),
  ('b7', 'Marriott Center', 'MC', 40.2533, -111.6483, 'Marriott Center'),
  ('b8', 'Harris Fine Arts Center', 'HFAC', 40.2504, -111.6525, 'Harris Fine Arts Center'),
  ('b9', 'Engineering Building', 'EB', 40.2475, -111.6469, '450 Engineering Building'),
  ('b10', 'Crabtree Technology Building', 'CTB', 40.2470, -111.6485, 'Crabtree Technology Building')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, icon) VALUES
  ('c1', 'Academic', 'school'),
  ('c2', 'Social', 'people'),
  ('c3', 'Sports', 'fitness-center'),
  ('c4', 'Arts', 'palette'),
  ('c5', 'Service', 'volunteer-activism'),
  ('c6', 'Career', 'work'),
  ('c7', 'Tech', 'computer'),
  ('c8', 'Music', 'music-note'),
  ('c9', 'Outdoors', 'terrain'),
  ('c10', 'Cultural', 'public')
ON CONFLICT (id) DO NOTHING;

-- Clubs
INSERT INTO clubs (id, name, description, category_id, member_count, image_color, contact_email, website, instagram) VALUES
  ('cl1', 'BYU Developers', 'A community for software developers and aspiring engineers.', 'c7', 245, '#0062B8', 'devs@byu.edu', 'byudevs.com', '@byudevs'),
  ('cl2', 'Cougar Outdoors', 'Explore Utah''s wilderness with fellow Cougars.', 'c9', 389, '#10B981', 'outdoors@byu.edu', 'cougaroutdoors.byu.edu', '@cougaroutdoors'),
  ('cl3', 'BYU Dance Company', 'Premier student dance organization.', 'c4', 67, '#EC4899', 'dance@byu.edu', 'byudance.com', '@byudance'),
  ('cl4', 'Entrepreneurship Club', 'Pitch nights, mentors, startup resources.', 'c6', 178, '#F59E0B', 'eclub@byu.edu', 'byuentrepreneurs.com', '@byueclub'),
  ('cl5', 'Cougar Soccer Club', 'Recreational and competitive soccer.', 'c3', 156, '#EF4444', 'soccer@byu.edu', '', '@byusoccer'),
  ('cl6', 'International Students Association', 'Cultural events and community for international students.', 'c10', 312, '#8B5CF6', 'isa@byu.edu', 'byuisa.org', '@byuisa'),
  ('cl7', 'BYU Volunteer Corps', 'Service projects and mentoring.', 'c5', 523, '#14B8A6', 'volunteer@byu.edu', 'byuvolunteer.org', '@byuvolunteer'),
  ('cl8', 'Pre-Med Society', 'MCAT prep and med school resources.', 'c1', 201, '#0EA5E9', 'premed@byu.edu', 'byupremed.org', '@byupremed'),
  ('cl9', 'BYU Photography Club', 'Workshops and photo walks.', 'c4', 134, '#6366F1', 'photo@byu.edu', '', '@byuphoto'),
  ('cl10', 'Cougar Board Games', 'Board game nights and tournaments.', 'c2', 98, '#D97706', 'games@byu.edu', '', '@byugames'),
  ('cl11', 'BYU A Cappella', 'Student a cappella groups.', 'c8', 45, '#E11D48', 'acappella@byu.edu', 'byuacappella.com', '@byuacappella'),
  ('cl12', 'Data Science Club', 'ML, Kaggle, industry speakers.', 'c7', 167, '#7C3AED', 'datasci@byu.edu', 'byudatasci.com', '@byudatasci')
ON CONFLICT (id) DO NOTHING;

-- Club memberships
INSERT INTO club_memberships (id, user_id, club_id, role, joined_at) VALUES
  ('m1', 'user1', 'cl1', 'admin', NOW() - INTERVAL '90 days'),
  ('m2', 'user1', 'cl2', 'member', NOW() - INTERVAL '60 days'),
  ('m3', 'user2', 'cl1', 'member', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Events (upcoming; times relative to now)
INSERT INTO events (id, title, description, club_id, building_id, category_id, start_time, end_time, room, has_limited_capacity, max_capacity, current_reservations, has_food, food_description, tags, is_cancelled) VALUES
  ('e1', 'Intro to React Workshop', 'Learn React.js with hands-on exercises.', 'cl1', 'b1', 'c7', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '1.5 hours', '185', true, 40, 12, false, NULL, ARRAY['workshop','coding'], false),
  ('e2', 'Sunset Hike at Y Mountain', 'Scenic evening hike. Bring water.', 'cl2', 'b4', 'c9', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '6 hours', 'Lobby', false, NULL, 0, false, NULL, ARRAY['hiking'], false),
  ('e3', 'Startup Pitch Night', 'Student entrepreneurs pitch to investors.', 'cl4', 'b2', 'c6', NOW() + INTERVAL '8 hours', NOW() + INTERVAL '10.5 hours', 'Varsity Theater', true, 100, 45, true, 'Pizza', ARRAY['pitch'], false),
  ('e4', 'Pick-up Soccer', 'Weekly pickup game. All levels welcome.', 'cl5', 'b4', 'c3', NOW() + INTERVAL '24 hours', NOW() + INTERVAL '26 hours', 'Fields', false, NULL, 0, false, NULL, ARRAY['soccer'], false),
  ('e5', 'Board Game Tournament', 'Settlers of Catan with prizes.', 'cl10', 'b2', 'c2', NOW() + INTERVAL '26 hours', NOW() + INTERVAL '30 hours', '312', true, 32, 8, true, 'Snacks', ARRAY['games'], false),
  ('e6', 'Machine Learning Workshop', 'Neural networks with PyTorch.', 'cl12', 'b10', 'c7', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '6 hours', 'Lab 102', true, 30, 15, false, NULL, ARRAY['AI'], false)
ON CONFLICT (id) DO NOTHING;

-- Event saves (user1 saved a couple events)
INSERT INTO event_saves (id, user_id, event_id, saved_at) VALUES
  ('es1', 'user1', 'e1', NOW() - INTERVAL '1 day'),
  ('es2', 'user1', 'e3', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Reservations
INSERT INTO reservations (id, user_id, event_id, reserved_at, status) VALUES
  ('r1', 'user1', 'e1', NOW() - INTERVAL '1 day', 'confirmed'),
  ('r2', 'user2', 'e3', NOW() - INTERVAL '2 hours', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- Announcements
INSERT INTO announcements (id, club_id, title, body, created_at) VALUES
  ('a1', 'cl1', 'Hackathon Registration Open', 'Sign up on our website.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Notifications (sample)
INSERT INTO notifications (id, user_id, type, title, body, read, created_at, related_id) VALUES
  ('n1', 'user1', 'event_change', 'Event time updated', 'Intro to React Workshop starts in 30 min.', false, NOW(), 'e1')
ON CONFLICT (id) DO NOTHING;

COMMIT;
