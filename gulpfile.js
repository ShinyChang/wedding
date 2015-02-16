var gulp = require('gulp'),
    // less = require('gulp-less'),
    livereload = require('gulp-livereload');

// gulp.task('less', function() {
//   gulp.src('less/*.less')
//     .pipe(less())
//     .pipe(gulp.dest('css'))
//     .pipe(livereload());
// });

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('css/*.css', function(){
        gulp.src("css/*.css")
            .pipe(livereload());
    });
});