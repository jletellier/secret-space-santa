import { Mongo } from 'meteor/mongo';
import './methods';

export const Groups = new Mongo.Collection('groups');
export const Participants = new Mongo.Collection('participants');
