'use strict';

exports = module.exports = function(db, mongoose) {
  var peopleSchema = new mongoose.Schema({
    name: {
      russian: { type: String, default: '' },
      original: { type: String, default: '' }
    },
    sID: { type: Number, default: 0 },
    imdbID: { type: String, default: '' }
  });

  peopleSchema.pre('save', function(next) {
    var self = this;

    if (self.isNew) {
      db.models.Index.findOne({ 'name': 'People' }).exec(function(err, r) {
        if (err) return next(err);

        if (r == null) {
            var newI = new db.models.Index({
                name: 'People',
                sID: 1
            });
            newI.save(function (err, r) {
              if (err) {
                console.log(err);
              }

              self.sID = 1;
              next();
            });
        } else {
          self.sID = r.sID+1;

          db.models.Index.findOneAndUpdate({ name: 'People' }, { sID: self.sID }, function (err, r) {
            if (err) return next(err);

            next();
          });
        }
      });
    } else {
      next();
    }
  });

  db.model('People', peopleSchema);
};
