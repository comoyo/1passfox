var gulp = require('gulp');
var uglify = require('gulp-uglify');
//var imagemin = require('gulp-imagemin');
var es = require('event-stream');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var csso = require('gulp-csso');
var react = require('gulp-react');

gulp.task('clean', function() {
  gulp.src(['./build/js/**/*.js', './build/css/**/*.css'], { read: false })
    .pipe(rimraf());
});

gulp.task('build', function() {
  gulp.run('clean', function() {
    gulp.src(['js/vendor/*.js', 'js/lib/*.js', 'js/crypto/*.js'])
      .pipe(uglify())
//      .pipe(concat("libs.js"))
      .pipe(gulp.dest('build/js'));

    gulp.src(['js/jsx/*.js'])
      .pipe(react())
      .pipe(uglify())
      .pipe(concat("components.js"))
      .pipe(gulp.dest('build/js'));

    gulp.src(['manifest.webapp'])
      .pipe(gulp.dest('build'));

    gulp.src('./css/*.css')
      .pipe(csso())
      .pipe(gulp.dest('./build/css'));
  });
});

