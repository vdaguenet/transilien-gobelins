var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');


/*
  Copy images to deploy folder
  can be used to process images (imagemin, svgo...)
*/

gulp.task('images', function() {
  return gulp.src(['./assets/images/**/*', '!./assets/images/**/line.svg'])
    .pipe(imagemin({
        optimizationLevel: 4,
        progressive: true,
        svgoPlugins: [{
            removeViewBox: false
        }],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./assets/images.min/'));
});