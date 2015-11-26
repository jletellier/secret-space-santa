Meteor.publish('userData', function() {
    if (this.userId) {
        return getUserWithAdminField(this.userId);
    }
    else {
        this.ready();
    }
});

Meteor.publish('participants', function() {
    var fields = { '_id': 1, 'drawn': 1 };
    if (this.userId) {
        var users = getUserWithAdminField(this.userId).fetch();
        if (users.length && users[0].isAdmin) {
            Object.assign(fields, { 'name': 1, 'drawnParticipant': 1 });
        }
    }

    return Participants.find({}, { fields: fields });
});

function getUserWithAdminField(userId) {
    return Meteor.users.find({ _id: userId }, { fields: { 'isAdmin': 1 } });
}