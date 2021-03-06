var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyInline = require('gulp-minify-inline');

var minifyOptions = {
  //js: false
};
  
var criticalSegment = [
  // polymer nano
  '../../../components/polymer/polymer-nano.html',
  // components
  '../../../components/nano-elements/nano-layout.html',
  '../../../components/nano-elements/nano-ripple.html',
  '../../../components/nano-elements/nano-anchor.html',
  // assets
  '../../../components/icons-simple.html',
  // data
  '../views.html',
  '../translate.html',
  // views
  '../src/settings-view.html',
  '../src/people-view.html',
  '../src/on-startup-view.html',
  '../src/appearance-view.html'
];

gulp.task('default', function() {
  return gulp.src(criticalSegment)
    .pipe(concat('critical.html'))
    .pipe(minifyInline(minifyOptions))
    .pipe(gulp.dest('../'))
  ;
});
