'use strict';
var gulp = require('gulp');
require('./node_modules/gulp-release-it/main')(gulp);
var impExp = require('./index');

gulp.task('test', function() {
    impExp.importPackage({unityPath:'error', destination: '__rav/something', moveThese: 'nothing'})
    .then(message => {console.log(message)})
    .catch(error => {console.error(error)});
});