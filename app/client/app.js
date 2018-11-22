import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import page from 'page';
import moment from 'moment';

import { Groups, Participants } from '../imports/api/collections';

let queryGroup = new ReactiveVar(null);
let queryParticipant = new ReactiveVar(null);

Meteor.subscribe('userData');
Meteor.subscribe('groups');

Tracker.autorun(() => {
    let group = queryGroup.get();
    if (group) {
        Meteor.subscribe('participants', group._id);
    }
});

Meteor.startup(() => {
    page('/', (ctx) => {
        queryGroup.set(null);
        queryParticipant.set(null);
    });

    page('/g/:group', (ctx) => {
        queryParticipant.set(null);

        const groupId = ctx.params.group;
        Meteor.call('getQueryGroup', groupId, (error, result) => {
            queryGroup.set(result);
        });
    });

    page('/p/:participant', (ctx) => {
        queryGroup.set(null);

        const participantId = ctx.params.participant;
        Meteor.call('getQueryParticipant', participantId, (error, result) => {
            queryParticipant.set(result);
        });
    });

    page();
});

Template.statistics.helpers({
    remaining() {
        let group = queryGroup.get();
        let remaining = moment(group.targetDate).fromNow();
        return remaining;
    },

    targetDate() {
        let group = queryGroup.get();
        return moment(group.targetDate).format('YYYY-MM-DD HH:mm');
    },

    participantCount() {
        return Participants.find().count();
    },

    drawnCount() {
        let participantCount = Participants.find().count();
        let drawnCount = Participants.find({ drawn: true }).count();
        return drawnCount + ' (' + (drawnCount / participantCount * 100).toFixed(2) + '%)';
    },

    queryGroup() {
        return queryGroup.get();
    },
});
Template.statistics.events({
    'click .change-date': function() {
        let group = queryGroup.get();
        let $modal = $('.sss-change-date-modal');
        $modal.modal('show');
        let $input = $modal.find('input');
        $input.val(moment(group.targetDate).format('YYYY-MM-DDTHH:mm'));
        let $saveBtn = $modal.find('.save-date');
        $saveBtn.click(() => {
            $modal.modal('hide');
        });
        $modal.on('hide.bs.modal', () => {
            let newValue = moment($input.val());
            if (newValue.isValid()) {
                Meteor.call('changeTargetDate', group._id, newValue.format());
            }
        });
    }
});

Template.settings.helpers({
    queryGroup() {
        return queryGroup.get();
    },
});

Template.participant.helpers({
    queryParticipant() {
        return queryParticipant.get();
    }
});

Template.admin.helpers({
    hasAdminPermission() {
        let user = Meteor.user();
        let group = queryGroup.get();
        return (user && group && group.adminUser === user._id);
    },

    loggedIn() {
        return (Meteor.user() !== null);
    },

    queryGroup() {
        return queryGroup.get();
    },
});
Template.admin.events({
    'click .add-group': function() {
        // This is very ugly
        // TODO: Replace with better solution
        let groupName = prompt('Please enter the new group name', '');
        groupName.trim();

        if (groupName.length) {
            Meteor.call('addGroup', groupName, (error, result) => {
                if (!error) {
                    page(`/g/${result}`);
                }
            });
        }
    },

    'click .add-item': function() {
        // This is very ugly
        // TODO: Replace with better solution
        let participantName = prompt('Please enter the name of the new participant', '');
        participantName.trim();

        if (participantName.length) {
            let group = queryGroup.get();
            Meteor.call('addParticipant', group._id, participantName);
        }
    },

    'click .auto-assign': function() {
        let group = queryGroup.get();
        Meteor.call('autoAssign', group._id);
    },
});

Template.adminList.helpers({
    participants() {
        return Participants.find({}, { sort: { name: 1 } });
    },
});
Template.adminListItem.onCreated(function() {
    this.reveal = new ReactiveVar(false);
});
Template.adminListItem.helpers({
    freeParticipants() {
        return Participants.find({ drawn: false }, { sort: { name: 1 } });
    },

    reveal() {
        return Template.instance().reveal.get();
    },
});
Template.adminListItem.events({
    'change select': function(event) {
        let participant = this.name;
        let selected = $(event.target).val();
        let group = queryGroup.get();

        Meteor.call('setDrawnParticipant', group._id, participant, selected);
    },

    'click .remove-item': function() {
        let group = queryGroup.get();
        Meteor.call('removeParticipant', group._id, this.name);
    },

    'click .reveal-item': function() {
        let instance = Template.instance();
        instance.reveal.set(!instance.reveal.get());
    },

    'click .share-item': function() {
        let $modal = $('.sss-share-item-modal');
        $modal.modal('show');
        let $content = $modal.find('.sss-share-item-modal-content');
        $content.text('p/' + this._id);
    },
});

Template.groupList.helpers({
    groups() {
        return Groups.find({}, { sort: { name: 1 } });
    },
});

Template.groupListItem.helpers({
    link() {
        return `/g/${this._id}`;
    },

    targetDate() {
        return moment(this.targetDate).format('YYYY-MM-DD HH:mm');
    },
});
Template.groupListItem.events({
    'click .remove-item': function() {
        Meteor.call('removeGroup', this._id);
    },
});
