var gulp = require('gulp');
var concat = require('gulp-concat');
var newer = require('gulp-newer');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var debug = require('gulp-debug-streams');
var less = require('gulp-less');
var uglifycss = require('gulp-uglifycss');
var livereload = require('gulp-livereload');
var wpPot = require('gulp-wp-pot');
var sort = require('gulp-sort');

var base = 'assets/js';

gulp.task('js', function() {
  gulp.src(['assets/js/*.js', '!assets/js/*.min.js'])
    .pipe(uglify({mangle:false}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('assets/js/'))
    .pipe(livereload());
});

gulp.task('css', function () {
  gulp.src(['assets/css/*.css', 'assets/css/*.less', '!assets/css/*.min.css'])
    .pipe(less())
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('assets/css/'))
    .pipe(livereload());
});

gulp.task('pot', function () {
    return gulp.src('**/*.php')
        .pipe(sort())
        .pipe(wpPot({
            domain: 'mondula-multistep-forms', // TODO
            destfile: 'mondula-form-wizard.pot', // TODO
            package: 'mondula-multistep-forms', // TODO
            bugReport: 'http://mondula.com/kontakt', // TODO
            lastTranslator: 'Lewe Ohlsen <lewe.ohlsen@mondula.com>',
            team: 'Mondula GmbH <wp-plugins@mondula.com>'
        }))
        .pipe(gulp.dest('lang'));
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('assets/js/*.js', ['js']);
    gulp.watch('assets/css/*.css', ['css']);
    gulp.watch('assets/css/*.less', ['css']);
});

gulp.task('default', ['js', 'css']);
