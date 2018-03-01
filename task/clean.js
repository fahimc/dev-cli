var gulp = require('gulp');
var clean = require('gulp-clean');

module.exports = function() {
    gulp.task('clean-assets',['make-dist'], function() {
        return gulp.src('dist/assets/**', {read: false})
        .pipe(clean());
    });
}