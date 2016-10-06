import { Mongo } from 'meteor/mongo';

export const Pees = new Mongo.Collection('pees');

Pees.before.insert(function (userId, doc) {
  doc.createdAt = new Date();
});
