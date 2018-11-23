import { Mongo } from 'meteor/mongo';
import './methods';

export const Groups = new Mongo.Collection('groups');
export const Participants = new Mongo.Collection('participants');
export const VapidKeys = new Mongo.Collection('vapid-keys');
export const PushSubscriptions = new Mongo.Collection('push-subscriptions');
