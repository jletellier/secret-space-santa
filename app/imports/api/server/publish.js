import { Meteor } from 'meteor/meteor';
import { Groups, Participants } from '../collections';

Meteor.publish('userData', function() {
    if (this.userId) {
        return getUserWithAdminField(this.userId);
    }
    else {
        this.ready();
    }
});

Meteor.publish('participants', function(groupId) {
    let fields = { 'groupId': 1, 'drawn': 1 };

    if (this.userId) {
        let group = Groups.findOne(groupId);
        if (group && group.adminUser === this.userId) {
            Object.assign(fields, { '_id': 1, 'name': 1, 'drawnParticipant': 1 });
        }
    }

    return Participants.find({ groupId }, { fields });
});

Meteor.publish('groups', function() {
    if (this.userId) {
        return Groups.find({ adminUser: this.userId });
    }
    else {
        this.ready();
    }
});

function getUserWithAdminField(userId) {
    return Meteor.users.find({ _id: userId }, { fields: { 'isAdmin': 1 } });
}
