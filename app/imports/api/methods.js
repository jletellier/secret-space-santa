import { Meteor } from 'meteor/meteor';
import { Participants } from './collections';

Meteor.methods({
    setDrawnParticipant(participant, selected) {
        clearCorrespondingDrawnAttribute(participant);

        Participants.update({ name: participant }, { $set: { drawnParticipant: selected } });
        Participants.update({ name: selected }, { $set: { drawn: true } });
    },

    removeParticipant(participant) {
        clearCorrespondingDrawnAttribute(participant);

        // Clear corresponding drawnParticipant field
        Participants.update({ drawnParticipant: participant }, { $set: { drawnParticipant: null } });

        Participants.remove({ name: participant });
    },

    addParticipant(participant) {
        Participants.insert({ name: participant, drawn: false, drawnParticipant: null });
    },

    autoAssign() {
        let participants = Participants.find().fetch();
        let names = participants.map((obj) => obj.name);
        let assigned;

        do {
            assigned = shuffle(names.slice());
        }
        while (assigned.map((e, i) => e === names[i]).reduce((a, b) => a + b));

        assigned.forEach(function(e, i) {
            Participants.update({ name: names[i] }, { $set: {
                drawnParticipant: e,
                drawn: true
            } });
        });
    },

    getQueryUser(id) {
        return Participants.findOne({ _id: id });
    }
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

function clearCorrespondingDrawnAttribute(participant) {
    let entry = Participants.findOne({ name: participant });
    if (entry) {
        let oldSelected = entry.drawnParticipant;
        if (oldSelected) {
            Participants.update({ name: oldSelected }, { $set: { drawn: false } });
        }
    }
}
