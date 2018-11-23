self.addEventListener('push', (event) => {
    if (event.data) {
        console.log('This push event has data: ', event.data.text());
    } 
    else {
        console.log('This push event has no data.');
    }

    const promiseChain = self.registration.showNotification(event.data.text());
    event.waitUntil(promiseChain);
});
