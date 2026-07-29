import * as webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { PushSubscription as DbPushSub } from "@prisma/client";

let vapidInitialized = false;
function ensureVapid() {
  if (vapidInitialized) return;
  const subject = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error("VAPID environment variables are not set.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidInitialized = true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/** Send a push notification to all subscriptions for a given userId */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureVapid();
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const results = await Promise.allSettled(
    subs.map((sub: DbPushSub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
  // Clean up expired / invalid subscriptions (410 Gone)
  const gone: string[] = [];
  results.forEach((r: PromiseSettledResult<webpush.SendResult>, i: number) => {
    if (r.status === "rejected") {
      const err = r.reason as { statusCode?: number };
      if (err?.statusCode === 410) gone.push(subs[i].id);
    }
  });
  if (gone.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });
  }
  return results;
}

/** Send to all coach/admin users */
export async function sendPushToCoaches(payload: PushPayload) {
  const coaches = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    select: { id: true },
  });
  return Promise.all(coaches.map((c: { id: string }) => sendPushToUser(c.id, payload)));
}
