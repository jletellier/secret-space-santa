import { Groups } from './collections';

export const checkGroupCred = function(userId, groupId) {
    let group = Groups.findOne(groupId);
    return (userId && group && group.adminUser === userId);
};
