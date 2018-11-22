import { Mongo } from 'meteor/mongo';
import './methods';

export const Participants = new Mongo.Collection('participants');
