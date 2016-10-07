import { Mongo } from 'meteor/mongo';

export const Pees = new Mongo.Collection('pees');

Pees.before.insert(function (userId, doc) {
  if(!doc.createdAt){
    doc.createdAt = new Date();
  } else {
    doc.createdAt = new Date(doc.createdAt);
  }
});
