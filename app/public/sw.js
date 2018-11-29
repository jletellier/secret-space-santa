self.addEventListener('push', (event) => {
    const data = event.data.json();

    const title = 'Secret Space Santa';
    const options = {
        body: data.message,
        tag: 'santa-notification',
        data: { goToUrl: data.goToUrl },
        icon: '/android-chrome-192x192.png',
    };
    
    const promiseChain = self.registration.showNotification(title, options);
    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === data.goToUrl) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            return matchingClient.focus();
        } 
        else {
            return clients.openWindow(data.goToUrl);
        }
    });

    event.waitUntil(promiseChain);
});
