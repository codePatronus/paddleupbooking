
-- 1) Demo auth users + profiles
DO $mig$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT * FROM (VALUES
    ('cf3e3bde-7ef7-4540-b89e-2b59fe7ed2bc'::uuid,'aditya_smash','Aditya Sharma','advanced','male',12,4,8,1450,'9876500001'),
    ('acf2f418-026d-4b01-aa9c-2d627b28c50a'::uuid,'priya_p','Priya Patel','intermediate','female',22,9,13,1180,'9876500002'),
    ('54d84918-0a29-46e1-a6fe-8e5ad19ffea1'::uuid,'rohaniyer','Rohan Iyer','advanced','male',13,8,5,1520,'9876500003'),
    ('7dec0511-15e4-41d6-b576-de784f32c1c4'::uuid,'ananya_r','Ananya Reddy','intermediate','female',39,15,24,1220,'9876500004'),
    ('4ad243d3-75c7-4fca-a0d2-235e351185a0'::uuid,'karthik_n','Karthik Nair','beginner','male',32,11,21,950,'9876500005'),
    ('e4d5b416-2560-4262-a55c-59f7be5df175'::uuid,'meera_k','Meera Krishnan','advanced','female',10,4,6,1380,'9876500006'),
    ('1190c20a-526d-4cfe-a121-23443f914e34'::uuid,'arjun_m','Arjun Menon','intermediate','male',37,21,16,1150,'9876500007'),
    ('3db4e76d-8e7c-4d2f-b078-1db5fdd8b73a'::uuid,'divya_r','Divya Rao','beginner','female',40,17,23,980,'9876500008'),
    ('8f689830-3bca-4089-9a58-5fdcd6a5963b'::uuid,'vikram_k','Vikram Kulkarni','advanced','male',39,20,19,1420,'9876500009'),
    ('c5cd2a58-550d-4ba4-a2e4-f1f11ebee413'::uuid,'snehap','Sneha Pillai','intermediate','female',33,19,14,1240,'9876500010'),
    ('338edf9d-c15b-408b-9f40-56e34186ad71'::uuid,'rahul_v','Rahul Verma','beginner','male',5,3,2,920,'9876500011'),
    ('5eab0eb4-0b5e-4a68-9615-becf18087e22'::uuid,'ishaang','Ishaan Gupta','intermediate','male',28,14,14,1190,'9876500012'),
    ('a1b2c3d4-e5f6-4789-a012-345678901201'::uuid,'neha_s','Neha Subramanian','advanced','female',18,10,8,1350,'9876500013'),
    ('a1b2c3d4-e5f6-4789-a012-345678901202'::uuid,'aryan_c','Aryan Choudhary','intermediate','male',26,12,14,1130,'9876500014'),
    ('a1b2c3d4-e5f6-4789-a012-345678901203'::uuid,'kavya_m','Kavya Menon','beginner','female',14,6,8,960,'9876500015')
  ) AS t(id,username,display_name,skill_level,gender,matches,wins,losses,elo,phone)
  LOOP
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.username||'@demo.paddleup', crypt('demopass123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (id, username, display_name, skill_level, gender, matches_played, wins, losses, elo_rating, phone, bio)
    VALUES (u.id, u.username, u.display_name, u.skill_level::skill_level, u.gender, u.matches, u.wins, u.losses, u.elo, u.phone, 'Demo player')
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $mig$;

-- 2) Clear old synthetic bookings
DELETE FROM bookings WHERE user_id IS NULL OR user_id IN (SELECT id FROM profiles WHERE bio = 'Demo player');

-- 3) Generate bookings for past 60 days
DO $seed$
DECLARE
  d date;
  is_weekend boolean;
  target_count int;
  made int;
  attempts int;
  court int;
  hour int;
  amt int;
  r float;
  status text;
  pick_user boolean;
  chosen_uid uuid;
  chosen_name text;
  chosen_phone text;
  walk_names text[] := ARRAY['Rakesh Bhat','Sanjay Iyengar','Pooja Shetty','Farhan Sheikh','Tanvi Deshpande','Manish Yadav'];
  walk_phones text[] := ARRAY['9812340001','9812340002','9812340003','9812340004','9812340005','9812340006'];
  widx int;
  demo_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO demo_ids FROM profiles;

  FOR i IN 1..60 LOOP
    d := (CURRENT_DATE - i);
    is_weekend := EXTRACT(DOW FROM d) IN (0,6);
    target_count := CASE WHEN is_weekend THEN 9 + floor(random()*3)::int ELSE 6 + floor(random()*2)::int END;
    made := 0; attempts := 0;
    WHILE made < target_count AND attempts < 80 LOOP
      attempts := attempts + 1;
      court := 1 + floor(random()*3)::int;
      IF random() < 0.6 THEN
        hour := 16 + floor(random()*6)::int;
      ELSE
        hour := 8 + floor(random()*8)::int;
      END IF;
      IF EXISTS (SELECT 1 FROM bookings WHERE court_number=court AND booking_date=d AND slot_hour=hour) THEN
        CONTINUE;
      END IF;
      amt := CASE WHEN hour >= 16 THEN 800 ELSE 600 END;
      r := random();
      status := CASE WHEN r<0.85 THEN 'completed' WHEN r<0.93 THEN 'cancelled' ELSE 'pending' END;
      pick_user := random() < 0.65;
      IF pick_user THEN
        chosen_uid := demo_ids[1 + floor(random()*array_length(demo_ids,1))::int];
        SELECT display_name, COALESCE(phone,'9800000000') INTO chosen_name, chosen_phone FROM profiles WHERE id=chosen_uid;
      ELSE
        chosen_uid := NULL;
        widx := 1 + floor(random()*array_length(walk_names,1))::int;
        chosen_name := walk_names[widx];
        chosen_phone := walk_phones[widx];
      END IF;
      INSERT INTO bookings (court_number, booking_date, slot_hour, customer_name, customer_phone, amount, payment_status, user_id, created_at)
      VALUES (court, d, hour, chosen_name, chosen_phone, amt, status, chosen_uid, d + interval '10 hours');
      made := made + 1;
    END LOOP;
  END LOOP;
END $seed$;
