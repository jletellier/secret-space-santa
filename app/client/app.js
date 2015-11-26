Meteor.subscribe('userData');
Meteor.subscribe('participants');

var targetDate = moment.utc('2015-12-04 19:00:00');
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
        var participantCount = Participants.find().count();
        var drawnCount = Participants.find({ drawn: true }).count();
        return drawnCount + ' (' + (drawnCount / participantCount * 100).toFixed(2) + '%)';
    }
});

Template.admin.helpers({
    hasAdminPermission: function() {
        var user = Meteor.user();
        return (user && user.isAdmin);
    }
});
Template.admin.events({
    'click .add-item': function() {
        // This is very ugly
        // TODO: Replace with better solution
        var participant = prompt('Please enter the new name', '');

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
        var participant = this.name;
        var selected = $(event.target).val();

        Meteor.call('setDrawnParticipant', participant, selected);
    },

    'click .remove-item': function() {
        var participant = this.name;

        Meteor.call('removeParticipant', participant);
    }
});