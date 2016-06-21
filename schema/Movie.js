'use strict';

exports = module.exports = function(db, mongoose) {
    var movieSchema = new mongoose.Schema({
        sID: Number,
        titles: [
            {
                country: String,
                title: String
            }
        ],
        poster: [
            {
                country: String,
                url: String
            }
        ],
        genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
        country: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
        people: [{ type: mongoose.Schema.Types.ObjectId, ref: 'People', role: '' }],
        runtime: Number,
        year: Number,
        released: { type: Date, default: null },
        plot: String,
        imdbID: String,
        wishList: Number,
        views: Number,
        viewsUser: Number,
        dateUpdate: { type: Date, default: Date.now },
        type: { type: String, default: 'movie' },
        search: String
    });
    // movieSchema.index({ 'title.original': 'text', 'title.russian': 'text', 'plot': 'text'});
    db.model('Movie', movieSchema);

    db.models.Index.findOne({ 'name': 'Movie' }).exec(function(err, r) {
        if (r == null) {
            var newI = new db.models.Index({
                name: 'Movie',
                sID: 1
            });
            newI.save(function (err, r) {

            });
        }
    });
};
