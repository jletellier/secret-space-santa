import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { Groups, Participants, VapidKeys, PushSubscriptions } from './collections';
import { checkGroupCred } from './security';

Meteor.methods({
    addGroup(groupName) {
        if (!this.userId) {
            return null;
        }

        let targetDate = moment().set({ 'month': 11, 'date': 24, 'hour': 18 });

        const groupId = Groups.insert({ 
            name: groupName, 
            targetDate: targetDate.format(),
            adminUser: this.userId,
        });

        return groupId;
    },

    removeGroup(groupId) {
        if (!checkGroupCred(this.userId, groupId)) {
            return null;
        }

        Participants.remove({ groupId });
        Groups.remove(groupId);
    },

    changeTargetDate(groupId, targetDate) {
        if (!checkGroupCred(this.userId, groupId)) {
            return null;
        }

        Groups.update(groupId, { $set: { targetDate } });
    },
    
    setDrawnParticipant(groupId, participant, selected) {
        if (!checkGroupCred(this.userId, groupId)) {
            return null;
        }

        clearCorrespondingDrawnAttribute(groupId, participant);

        Participants.update(
            { groupId, name: participant }, 
            { $set: { drawnParticipant: selected }, 
        });
        Participants.update(
            { groupId, name: selected }, 
            { $set: { drawn: true },
        });
    },

    removeParticipant(groupId, participant) {
        if (!checkGroupCred(this.userId, groupId)) {
            return null;
        }

        clearCorrespondingDrawnAttribute(groupId, participant);

        // Clear corresponding drawnParticipant field
        Participants.update(
            { groupId, drawnParticipant: participant }, 
            { $set: { drawnParticipant: null } 
        });

        Participants.remove({ groupId, name: participant });
    },

    addParticipant(groupId, participantName) {
        if (!checkGroupCred(this.userId, groupId)) {
            return null;
        }

        Participants.insert({ 
            name: participantName, 
            drawn: false, 
            drawnParticipant: null, 
            groupId
        });
    },

    autoAssign(groupId) {
        if (!checkGroupCred(this.userId, groupId)) {
            return null;
        }

        let participants = Participants.find({ groupId }).fetch();
        let names = participants.map((obj) => obj.name);
        let assigned;

        do {
            assigned = shuffle(names.slice());
        }
        while (assigned.map((e, i) => e === names[i]).reduce((a, b) => a + b));

        assigned.forEach(function(e, i) {
            Participants.update({ groupId, name: names[i] }, { $set: {
                drawnParticipant: e,
                drawn: true
            } });
        });
    },

    getQueryGroup(id) {
        if (!checkGroupCred(this.userId, id)) {
            return null;
        }

        return Groups.findOne({ _id: id });
    },

    getQueryParticipant(id) {
        return Participants.findOne({ _id: id });
    },

    getVapidKey() {
        return VapidKeys.findOne({}, { fields: { 'publicKey': 1 } });
    },

    savePushSubscription(subscriptionString) {
        PushSubscriptions.insert(JSON.parse(subscriptionString));
    },

    updatePushSubscription(subscriptionString, participantId) {
        const endpoint = JSON.parse(subscriptionString).endpoint;
        const subscription = PushSubscriptions.findOne({ endpoint });
        
        if (subscription && !participantId) {
            // Remove old subscription
            Participants.update(
                { subscriptionId: subscription._id }, 
                { $set: { subscriptionId: null} },
            );
            PushSubscriptions.remove(subscription);
            return;
        }
        else if (subscription) {
            // Update subscription
            Participants.update(participantId, { $set: { 
                subscriptionId: subscription._id,
                lastNotified: moment().toDate(),
            } });
        }
    },
});

// Copied from: http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function clearCorrespondingDrawnAttribute(groupId, participant) {
    let entry = Participants.findOne({ groupId, name: participant });
    if (entry) {
        let oldSelected = entry.drawnParticipant;
        if (oldSelected) {
            Participants.update({ groupId, name: oldSelected }, { $set: { drawn: false } });
        }
    }
}
