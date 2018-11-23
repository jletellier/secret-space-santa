import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import webpush from 'web-push';
import moment from 'moment';

import '../imports/api/server/publish';
import { VapidKeys, PushSubscriptions, Participants } from '../imports/api/collections.js';

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

    Meteor.setInterval(sendPushNotifications, 2000);
});

function sendPushNotifications() {
    let currentDate = moment();
    let targetDate = moment(currentDate).subtract({ 'hours': 12 });

    let participants = Participants.find({ 
        subscriptionId: { $exists: true },
        lastNotified: { $lt: targetDate.toDate() },
    });

    participants.forEach((el) => {
        console.log('Sending push notification to:', el.name);

        Participants.update(el, { $set: { 
            lastNotified: currentDate.toDate(),
        } });

        const subscription = PushSubscriptions.findOne(el.subscriptionId);
        const message = 'Hey Secret Santa, remember to buy a present.';

        webpush.sendNotification(
            { endpoint: subscription.endpoint, keys: subscription.keys },
            message,
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
