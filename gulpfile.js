const gulp = require('gulp');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const babel = require('gulp-babel');
const browserify = require('browserify');
const through = require('through2');
const htmlMinifier = require('gulp-html-minifier');
const replace = require('gulp-replace');
const gulpif = require('gulp-if');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync').create();
const argv = require('yargs').argv;

const pkg = require('./package.json');

gulp.task('build-css', _ =>
  gulp.src('app/*.css')
    .pipe(postcss([
      require('postcss-import')(),
      cssnext({features: {rem: {html: false}}}),
      require('cssnano')({ autoprefixer: false })
    ]))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
);

gulp.task('build-js', _ =>
  browserify('./app/app.js')
    .transform('babelify', { presets: ['latest', 'babili'] })
    .bundle()
    .pipe(source('./app.js'))
    .pipe(gulp.dest('./dist/'))
);

gulp.task('build-html', _ =>
  gulp.src('app/index.html')
    .pipe(htmlMinifier({
      minifyCSS: true,
      minifyJS: false,
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      customAttrCollapse: /^d$/,
      processScripts: ['text/x-template']
    }))
    .pipe(gulp.dest('dist'))
);

gulp.task('copy', _ =>
  gulp.src(['app/images/**/*'], {base: 'app'})
    .pipe(gulp.dest('dist'))
)

gulp.task('default', ['build-css', 'build-js', 'build-html', 'copy']);

gulp.task('serve', ['default'], function() {

  browserSync.init({
    server: './dist'
  });

  gulp.watch('app/*.css', ['build-css']);
  gulp.watch('app/*.js', ['build-js']).on('change', browserSync.reload);
  gulp.watch('app/*.html', ['build-html']).on('change', browserSync.reload);
  gulp.watch('dist/*/**').on('change', browserSync.reload);
});