import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '../imports/api/server/publish';

Meteor.startup(() => {
    // code to run on server at startup
});

Accounts.onCreateUser((options, user) => {
    // Give the first users that registers 'admin' rights
    if (Meteor.users.find().count() === 0) {
        user.isAdmin = true;
    }

    // We still want the default hook's 'profile' behavior.
    if (options.profile) user.profile = options.profile;
    return user;
});
