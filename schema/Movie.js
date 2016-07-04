'use strict';

exports = module.exports = function(db, mongoose) {
    var movieSchema = new mongoose.Schema({
        sID: Number,
        titles: [
            {
                country: String,
                title: String,
                description: String
            }
        ],
        poster: [
            {
                country: String,
                url: String,
                description: String
            }
        ],
        genre: [
          { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }
        ],
        country: [
          { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }
        ],
        people: [
          {
            type: mongoose.Schema.Types.ObjectId, ref: 'People',
            role: '',
            category: ''
          }
        ],
        runtime: Number,
        year: Number,
        released: [
            {
                country: String,
                date: Date,
                description: String
            }
        ],
        plot: String,
        imdbID: String,
        kinopoiskID: String,
        wishList: Number,
        views: Number,
        viewsUser: Number,
        dateUpdate: { type: Date, default: Date.now },
        type: { type: String, default: 'movie' },
        MPAA: { type: String, default: '' },
        search: String
    });
    // movieSchema.index({ 'title.original': 'text', 'title.russian': 'text', 'plot': 'text'});

    movieSchema.pre('save', function(next) {
      var self = this;

      if (self.isNew) {
        db.models.Index.findOne({ 'name': 'Movie' }).exec(function(err, r) {
          if (err) return next(err);

          if (r == null) {
              var newI = new db.models.Index({
                  name: 'Movie',
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

            db.models.Index.findOneAndUpdate({ name: 'Movie' }, { sID: self.sID }, function (err, r) {
              if (err) return next(err);

              next();
            });
          }
        });
      } else {
        next();
      }
    });
    db.model('Movie', movieSchema);
};
