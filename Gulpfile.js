'use strict';

const gulp = require('gulp');
const usemin = require('gulp-usemin');
const uglify = require('uglify-es');
const composer = require('gulp-uglify/composer');
const minifyHtml = require('gulp-minify-html');
const minifyCss = require('gulp-minify-css');
const rev = require('gulp-rev');
const del = require('del');

const minify = composer({
  minify: function (code) {
    return uglify.minify(code, {
      wrap: 'quake2',
    });
  },
}, console);

gulp.task('usemin', function () {
  return gulp.src('src/index.html')
    .pipe(usemin({
      css: [rev()],
      html: [minifyHtml({
        empty: true
      })],
      js: [minify({
        wrap: 'quake2',
      }), rev()],
      inlinejs: [minify()],
      inlinecss: [minifyCss(), 'concat']
    }))
    .pipe(gulp.dest('bin'));
});

gulp.task('baseq2', function () {
  return gulp.src('src/baseq2/**/*')
      .pipe(gulp.dest('bin/baseq2'));
});

gulp.task('jquery', function () {
  return gulp.src('src/js/jquery-3.2.1.min.js')
      .pipe(gulp.dest('bin/js/'));
});

gulp.task('default', gulp.series(['usemin', 'baseq2', 'jquery']));

gulp.task('clean', function () {
  return del(['bin']);
});
