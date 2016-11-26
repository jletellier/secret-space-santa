import { Meteor } from 'meteor/meteor';
import { Participants } from '../lib/collections';

Meteor.publish('userData', function() {
    if (this.userId) {
        return getUserWithAdminField(this.userId);
    }
    else {
        this.ready();
    }
});

Meteor.publish('participants', function() {
    let fields = { 'drawn': 1 };
    if (this.userId) {
        let users = getUserWithAdminField(this.userId).fetch();
        if (users.length && users[0].isAdmin) {
            Object.assign(fields, { '_id': 1, 'name': 1, 'drawnParticipant': 1 });
        }
    }

    return Participants.find({}, { fields: fields });
});

function getUserWithAdminField(userId) {
    return Meteor.users.find({ _id: userId }, { fields: { 'isAdmin': 1 } });
}