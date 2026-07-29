// Required by next-pwa's Workbox injection — do not remove this line
self.__WB_MANIFEST;

// Push notification event handler

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Honor Bound FIT", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Honor Bound FIT", {
      body: payload.body,
      icon: payload.icon ?? "/images/icon-192.png",
      badge: "/images/icon-192.png",
      tag: payload.tag,
      data: { url: payload.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
