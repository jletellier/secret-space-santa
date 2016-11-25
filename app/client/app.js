import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Participants } from '../lib/collections';

Meteor.subscribe('userData');
Meteor.subscribe('participants');

let targetDate = moment.utc('2016-12-23 18:00:00');
Session.setDefault('remaining', targetDate.fromNow());

Meteor.setInterval(function() {
    Session.set('remaining', targetDate.fromNow());
}, 5000);

Template.statistics.helpers({
    remaining: function() {
        return Session.get('remaining');
    },

    participantCount: function() {
        return Participants.find().count();
    },

    drawnCount: function() {
        let participantCount = Participants.find().count();
        let drawnCount = Participants.find({ drawn: true }).count();
        return drawnCount + ' (' + (drawnCount / participantCount * 100).toFixed(2) + '%)';
    }
});

Template.admin.helpers({
    hasAdminPermission: function() {
        let user = Meteor.user();
        return (user && user.isAdmin);
    }
});
Template.admin.events({
    'click .add-item': function() {
        // This is very ugly
        // TODO: Replace with better solution
        let participant = prompt('Please enter the new name', '');

        Meteor.call('addParticipant', participant);
    }
});

Template.adminList.helpers({
    participants: function() {
        return Participants.find({}, { sort: { name: 1 } });
    }
});

Template.adminListItem.helpers({
    freeParticipants: function() {
        return Participants.find({ drawn: false }, { sort: { name: 1 } });
    }
});
Template.adminListItem.events({
    'change select': function(event) {
        let participant = this.name;
        let selected = $(event.target).val();

        Meteor.call('setDrawnParticipant', participant, selected);
    },

    'click .remove-item': function() {
        let participant = this.name;

        Meteor.call('removeParticipant', participant);
    }
});