import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import webpush from 'web-push';
import moment from 'moment';

import '../imports/api/server/publish';
import { VapidKeys, PushSubscriptions, Participants } from '../imports/api/collections.js';

// Environment variable that specifies the interval of push notifications in minutes
const PUSH_INTERVAL_MINUTES = process.env.PUSH_INTERVAL_MINUTES || 1440;

Meteor.startup(() => {
    // Prepare vapid keys only once
    if (VapidKeys.find().count() === 0) {
        const generatedVapidKeys = webpush.generateVAPIDKeys();
        VapidKeys.insert(generatedVapidKeys);
    }

    let vapidKeys = VapidKeys.findOne({});
    webpush.setVapidDetails(
        'mailto:mail@santa.jletellier.de',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );

    Meteor.setInterval(sendPushNotifications, 10000);
});

function sendPushNotifications() {
    let currentDate = moment();
    let targetDate = moment(currentDate).subtract({ 'minutes': PUSH_INTERVAL_MINUTES });

    let participants = Participants.find({ 
        subscriptionId: { $ne: null },
        lastNotified: { $lt: targetDate.toDate() },
    });

    participants.forEach((el) => {
        console.log('Sending push notification to:', el.name);

        Participants.update(el, { $set: { 
            lastNotified: currentDate.toDate(),
        } });

        const subscription = PushSubscriptions.findOne(el.subscriptionId);
        const payload = {
            message: `Hey ${el.name}, remember to buy a present.`,
            goToUrl: Meteor.absoluteUrl('p/' + el._id),
        };

        webpush.sendNotification(
            { endpoint: subscription.endpoint, keys: subscription.keys },
            JSON.stringify(payload),
        );
    });
}

Accounts.onCreateUser((options, user) => {
    // Give the first users that registers 'admin' rights
    if (Meteor.users.find().count() === 0) {
        user.isAdmin = true;
    }

    // We still want the default hook's 'profile' behavior.
    if (options.profile) user.profile = options.profile;
    return user;
});
