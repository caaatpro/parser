'use strict';

exports = module.exports = function(db, mongoose) {
  var indexSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    sID: { type: Number, default: 0 }
  });
  db.model('Index', indexSchema);
};
