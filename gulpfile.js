var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    csslint = require('gulp-csslint'),
    jade = require('gulp-jade'),
    browserSync = require('browser-sync').create('minimal'),
    browserReload = browserSync.reload;

var postcss = require('gulp-postcss'),
    simplevars = require('postcss-simple-vars'),
    autoprefixer = require('autoprefixer-core'),
    mqpacker = require('css-mqpacker'),
    csswring = require('csswring');


gulp.task('jade', function() {
    return gulp.src('src/templates/*.jade')
        .pipe(plumber())
        .pipe(jade())
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function(){
  var processors = [
      csswring
    ];
  return gulp.src('src/css/main.css')
    .pipe(postcss(processors))
    .pipe(minifyCSS())
    .pipe(rename('main.min.css'))
    .pipe(size({gzip:true, showFiles: true}))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('minify-img', function(){
  gulp.src('src/img/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(gulp.dest('dist/img/'));
});

gulp.task('csslint', function(){
  gulp.src('src/css/main.css')
    .pipe(csslint({
        'compatible-vendor-prefixes': false,
        'box-sizing': false,
        'important': false,
        'known-properties': false
    }))
    .pipe(csslint.reporter());
});

gulp.task('pre-process', function(){
    var processors = [
        autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}),
        mqpacker
    ];
    return gulp.src("src/scss/**/*.scss")
        .pipe(sass())
        .on('error', swallowError)
        .pipe(postcss(processors))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('src/css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(minifyCSS())
        .pipe(rename('main.min.css'))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('src/css/'))
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('scripts', function() {
  return gulp.src(['src/js/app.js'])
    .pipe(plumber())
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
          baseDir: "dist/",
          injectChanges: true
        }
    });
});

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}

/* DEFAULT */
gulp.task('default', ['pre-process', 'scripts', 'jade', 'browser-sync'], function(){
    gulp.start('pre-process', 'csslint', 'minify-img');
    gulp.watch('src/scss/*', ['pre-process']);
    gulp.watch('src/js/**/*.js', ['scripts', browserReload]);
    gulp.watch('src/templates/*.jade', ['jade']);
    gulp.watch('dist/*.html', browserReload);
    gulp.watch('dist/css/*.css', browserReload);
});

