import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Member {
  id:         string;
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  membership: string;
  status:     'active' | 'pending' | 'expired' | 'cancelled';
  lastVisit:  string; // ISO date string
  joinedAt:   string; // ISO date string
}

// ---------------------------------------------------------------------------
// Mock data — drawn from real CSV names with plausible details filled in
// ---------------------------------------------------------------------------
const MEMBERS: Member[] = [
  {
    id:         '1',
    firstName:  'Randy',
    lastName:   'Franklin',
    email:      'randy.franklin@email.com',
    phone:      '(757) 555-0101',
    membership: 'Individual',
    status:     'active',
    lastVisit:  '2026-07-20',
    joinedAt:   '2024-01-15',
  },
  {
    id:         '2',
    firstName:  'Cookie',
    lastName:   'Ainsworth',
    email:      'cookie.ainsworth@email.com',
    phone:      '(757) 555-0102',
    membership: 'Family',
    status:     'active',
    lastVisit:  '2026-07-19',
    joinedAt:   '2023-11-03',
  },
  {
    id:         '3',
    firstName:  'Richard',
    lastName:   'Lim',
    email:      'richard.lim@email.com',
    phone:      '(757) 555-0103',
    membership: 'Couple',
    status:     'active',
    lastVisit:  '2026-07-21',
    joinedAt:   '2024-03-22',
  },
  {
    id:         '4',
    firstName:  'Marcus',
    lastName:   'Thompson',
    email:      'marcus.thompson@email.com',
    phone:      '(757) 555-0104',
    membership: 'Individual – GAP',
    status:     'active',
    lastVisit:  '2026-07-18',
    joinedAt:   '2024-05-10',
  },
  {
    id:         '5',
    firstName:  'Yvette',
    lastName:   'Morales',
    email:      'yvette.morales@email.com',
    phone:      '(757) 555-0105',
    membership: 'Family',
    status:     'active',
    lastVisit:  '2026-07-17',
    joinedAt:   '2023-08-30',
  },
  {
    id:         '6',
    firstName:  'Derek',
    lastName:   'Washington',
    email:      'derek.washington@email.com',
    phone:      '(757) 555-0106',
    membership: 'Individual',
    status:     'active',
    lastVisit:  '2026-07-15',
    joinedAt:   '2024-02-14',
  },
  {
    id:         '7',
    firstName:  'Tamika',
    lastName:   'Scott',
    email:      'tamika.scott@email.com',
    phone:      '(757) 555-0107',
    membership: 'Couple',
    status:     'active',
    lastVisit:  '2026-07-20',
    joinedAt:   '2023-12-01',
  },
  {
    id:         '8',
    firstName:  'James',
    lastName:   "O'Brien",
    email:      'james.obrien@email.com',
    phone:      '(757) 555-0108',
    membership: 'Individual',
    status:     'expired',
    lastVisit:  '2026-05-30',
    joinedAt:   '2022-09-01',
  },
  {
    id:         '9',
    firstName:  'Priya',
    lastName:   'Nair',
    email:      'priya.nair@email.com',
    phone:      '(757) 555-0109',
    membership: 'Family – GAP',
    status:     'active',
    lastVisit:  '2026-07-21',
    joinedAt:   '2024-06-20',
  },
  {
    id:         '10',
    firstName:  'Carlos',
    lastName:   'Reyes',
    email:      'carlos.reyes@email.com',
    phone:      '(757) 555-0110',
    membership: 'Individual',
    status:     'pending',
    lastVisit:  '2026-07-10',
    joinedAt:   '2026-07-10',
  },
];

// ---------------------------------------------------------------------------
// GET /api/admin/members
// ---------------------------------------------------------------------------
export async function GET() {
  // TODO: add authentication middleware / session check before wiring to prod

  return NextResponse.json(
    {
      members: MEMBERS,
      total:   MEMBERS.length,
      fetched: new Date().toISOString(),
    },
    { status: 200 },
  );
}
