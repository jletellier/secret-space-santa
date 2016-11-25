import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Participants } from '../lib/collections';

Accounts.onCreateUser(function(options, user) {
    // Give the first users that registers 'admin' rights
    if (Meteor.users.find().count() === 0) {
        user.isAdmin = true;
    }

    // We still want the default hook's 'profile' behavior.
    if (options.profile) user.profile = options.profile;
    return user;
});

Meteor.methods({
    setDrawnParticipant: function(participant, selected) {
        clearCorrespondingDrawnAttribute(participant);

        Participants.update({ name: participant }, { $set: { drawnParticipant: selected } });
        Participants.update({ name: selected }, { $set: { drawn: true } });
    },

    removeParticipant: function(participant) {
        clearCorrespondingDrawnAttribute(participant);

        // Clear corresponding drawnParticipant field
        Participants.update({ drawnParticipant: participant }, { $set: { drawnParticipant: null } });

        Participants.remove({ name: participant });
    },

    addParticipant: function(participant) {
        Participants.insert({ name: participant, drawn: false, drawnParticipant: null });
    }
});

function clearCorrespondingDrawnAttribute(participant) {
    let entry = Participants.findOne({ name: participant });
    if (entry) {
        let oldSelected = entry.drawnParticipant;
        if (oldSelected) {
            Participants.update({ name: oldSelected }, { $set: { drawn: false } });
        }
    }
}