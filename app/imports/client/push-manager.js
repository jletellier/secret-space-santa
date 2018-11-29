import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

export default class PushManager {

    constructor() {
        this.isInitialized = false;
        this.participantId = null;
        this.isLoading = new ReactiveVar(true);
        this.isActivated = new ReactiveVar(false);
        this.needsUpdate = false;

        if (!this.hasBrowserSupport()) {
            return;
        }

        const registeredParticipant = localStorage.getItem('registeredPushParticipant');
        if (registeredParticipant) {
            this.init();
            this.setParticipant(registeredParticipant);
        }
        else {
            this.isLoading.set(false);
        }
    }

    hasBrowserSupport() {
        if (!('serviceWorker' in navigator)) {
            console.warn('ServiceWorker not supported!');
            return false;
        }

        if (!('Notification' in window)) {
            console.warn('Notifications not supported!');
            return false;
        }

        if (!('PushManager' in window)) {
            console.warn('Push API not supported!');
            return false;
        }

        return true;
    }

    async init() {
        if (this.isInitialized) {
            return;
        }

        await this.registerServiceWorker();
        await this.requestNotificationPermission();
        await navigator.serviceWorker.ready;

        this.pushManager = this.registration.pushManager;
        this.isInitialized = true;
        this.updateParticipantId();
        console.log('ServiceWorker, Notification and Push are ready...');
    }

    registerServiceWorker() {
        return new Promise((resolve, reject) => {
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                this.registration = registration;
                console.log('ServiceWorker registration successful');
                resolve();
            }, (err) => {
                console.warn('ServiceWorker registration failed: ', err);
                reject();
            });
        });
    }

    requestNotificationPermission() {
        return new Promise((resolve, reject) => {
            window.Notification.requestPermission().then((result) => {
                if (result === 'denied') {
                    console.warn('Permission wasn\'t granted. Allow a retry.');
                    return reject();
                }
                if (result === 'default') {
                    console.warn('The permission request was dismissed.');
                    return reject();
                }
                
                console.log('The permission was granted.');
                return resolve();
                //navigator.serviceWorker.ready.then(serviceWorkerReady);
            });
        });
    }

    registerPushSubscribtion() {
        return new Promise((resolve, reject) => {
            Meteor.call('getVapidKey', (error, result) => {
                if (error) {
                    return reject();
                }

                const vapidPublicKey = result.publicKey;
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                };
            
                this.pushManager.subscribe(subscribeOptions).then((subscription) => {
                    this.subscription = subscription;
                    const subscriptionString = JSON.stringify(subscription);

                    Meteor.call('savePushSubscription', subscriptionString, (error) => {
                        if (error) {
                            return reject();
                        }

                        resolve();
                    });
                });
            });
        });
    }

    async updateParticipantId() {
        if (!this.isInitialized || !this.needsUpdate) {
            return;
        }

        this.isLoading.set(true);
        this.needsUpdate = false;

        this.subscription = await this.pushManager.getSubscription();
        if (!this.subscription) {
            await this.registerPushSubscribtion();
        }

        const subscriptionString = JSON.stringify(this.subscription);
        const participantId = this.participantId;

        Meteor.call('updatePushSubscription', subscriptionString, participantId, () => {
            if (!participantId) {
                this.subscription.unsubscribe().then(() => {
                    localStorage.removeItem('registeredPushParticipant');
                });
                this.isActivated.set(false);
            }
            else {
                localStorage.setItem('registeredPushParticipant', participantId);
                this.isActivated.set(true);
            }
            
            this.isLoading.set(false);
            this.updateParticipantId();
        });
    }

    setParticipant(participantId) {
        this.participantId = participantId;
        this.needsUpdate = true;
        this.updateParticipantId();
    }

    deactivate() {
        this.setParticipant(null);
    }

}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
