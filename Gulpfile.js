'use strict';

var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var del = require('del');

gulp.task('default', ['usemin', 'baseq2']);

gulp.task('usemin', function () {
  return gulp.src('src/index.html')
    .pipe(usemin({
      css: [rev()],
      html: [minifyHtml({
        empty: true
      })],
      js: [uglify(), rev()],
      inlinejs: [uglify()],
      inlinecss: [minifyCss(), 'concat']
    }))
    .pipe(gulp.dest('bin'));
});

gulp.task('baseq2', function () {
  return gulp.src('src/baseq2/**/*')
      .pipe(gulp.dest('bin/baseq2'));
});

gulp.task('clean', function () {
  return del(['bin']);
});
