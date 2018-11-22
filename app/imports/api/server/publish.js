import { Meteor } from 'meteor/meteor';
import { Groups, Participants } from '../collections';
import { checkGroupCred } from '../security';

Meteor.publish('userData', function() {
    if (this.userId) {
        return getUserWithAdminField(this.userId);
    }
    else {
        this.ready();
    }
});

Meteor.publish('participants', function(groupId) {
    if (!checkGroupCred(this.userId, groupId)) {
        return this.ready();
    }

    return Participants.find({ groupId });
});

Meteor.publish('groups', function() {
    if (!this.userId) {
        return this.ready();
    }

    return Groups.find({ adminUser: this.userId });
});

function getUserWithAdminField(userId) {
    return Meteor.users.find({ _id: userId }, { fields: { 'isAdmin': 1 } });
}
