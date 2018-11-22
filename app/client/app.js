import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import page from 'page';

import { Participants } from '../imports/api/collections';

Meteor.subscribe('userData');
Meteor.subscribe('participants');

let targetDate = moment.utc('2017-12-23 18:00:00');
let remaining = new ReactiveVar(targetDate.fromNow());

Meteor.setInterval(function() {
    remaining.set(targetDate.fromNow());
}, 5000);

let queryUser = new ReactiveVar(null);

Meteor.startup(() => {
    page('/u/:user', (ctx) => {
        const userId = ctx.params.user;
        Meteor.call('getQueryUser', userId, function(error, result) {
            queryUser.set(result);
            console.log(result);
        });
    });

    page();
});

Template.statistics.helpers({
    remaining: function() {
        return remaining.get();
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

Template.user.helpers({
    queryUser: function() {
        return queryUser.get();
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
    },
    'click .auto-assign': function() {
        Meteor.call('autoAssign');
    }
});

Template.adminList.helpers({
    participants: function() {
        return Participants.find({}, { sort: { name: 1 } });
    }
});

Template.adminListItem.onCreated(function() {
    this.reveal = new ReactiveVar(false);
});
Template.adminListItem.helpers({
    freeParticipants: function() {
        return Participants.find({ drawn: false }, { sort: { name: 1 } });
    },
    reveal: function() {
        return Template.instance().reveal.get();
    }
});
Template.adminListItem.events({
    'change select': function(event) {
        let participant = this.name;
        let selected = $(event.target).val();

        Meteor.call('setDrawnParticipant', participant, selected);
    },
    'click .remove-item': function() {
        Meteor.call('removeParticipant', this.name);
    },
    'click .reveal-item': function() {
        let instance = Template.instance();
        instance.reveal.set(!instance.reveal.get());
    },
    'click .share-item': function() {
        let $modal = $('.sss-share-item-modal');
        $modal.modal('show');
        let $content = $modal.find('.sss-share-item-modal-content');
        $content.text('u/' + this._id);
    }
});
