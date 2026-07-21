import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory member store — replace with a real DB query in production
// ---------------------------------------------------------------------------
interface StoredMember {
  checkInCode: string;
  firstName:   string;
  lastName:    string;
  membership:  string;
  status:      'active' | 'pending' | 'expired';
}

const MEMBER_STORE: StoredMember[] = [
  { checkInCode: 'HBF-001', firstName: 'Randy',   lastName: 'Franklin',   membership: 'Individual',      status: 'active'  },
  { checkInCode: 'HBF-002', firstName: 'Cookie',  lastName: 'Ainsworth',  membership: 'Family',          status: 'active'  },
  { checkInCode: 'HBF-003', firstName: 'Richard', lastName: 'Lim',        membership: 'Couple',          status: 'active'  },
  { checkInCode: 'HBF-004', firstName: 'Marcus',  lastName: 'Thompson',   membership: 'Individual – GAP', status: 'active'  },
  { checkInCode: 'HBF-005', firstName: 'Yvette',  lastName: 'Morales',    membership: 'Family',          status: 'active'  },
  { checkInCode: 'HBF-006', firstName: 'Derek',   lastName: 'Washington', membership: 'Individual',      status: 'active'  },
  { checkInCode: 'HBF-007', firstName: 'Tamika',  lastName: 'Scott',      membership: 'Couple',          status: 'active'  },
  { checkInCode: 'HBF-008', firstName: 'James',   lastName: 'O\'Brien',   membership: 'Individual',      status: 'expired' },
  { checkInCode: 'HBF-009', firstName: 'Priya',   lastName: 'Nair',       membership: 'Family – GAP',    status: 'active'  },
  { checkInCode: 'HBF-010', firstName: 'Carlos',  lastName: 'Reyes',      membership: 'Individual',      status: 'pending' },
];

// ---------------------------------------------------------------------------
// Lightweight check-in log (in-memory; swap for DB insert in production)
// ---------------------------------------------------------------------------
interface CheckInRecord {
  memberId:  string; // checkInCode used as ID here
  timestamp: string;
}
const checkInLog: CheckInRecord[] = [];

// ---------------------------------------------------------------------------
// POST /api/checkin
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: unknown };

    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : null;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Missing check-in code' },
        { status: 400 },
      );
    }

    const member = MEMBER_STORE.find((m) => m.checkInCode.toUpperCase() === code);

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found. Please check your code and try again.' },
        { status: 404 },
      );
    }

    if (member.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'Membership expired. Please renew at the front desk.' },
        { status: 403 },
      );
    }

    if (member.status === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Membership is pending approval. Please see staff.' },
        { status: 403 },
      );
    }

    // Record check-in
    checkInLog.push({ memberId: member.checkInCode, timestamp: new Date().toISOString() });

    return NextResponse.json(
      {
        success: true,
        member: {
          firstName:  member.firstName,
          lastName:   member.lastName,
          membership: member.membership,
        },
        checkedInAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[API /checkin] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
