'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const imagemin = require('gulp-imagemin');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const del = require('del');
const cheerio = require('gulp-cheerio');
const server = require('browser-sync').create();
const rollup = require('rollup-stream');
const babel = require('rollup-plugin-babel');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const svgSprite = require('gulp-svg-sprite');

gulp.task('copy', (done) => {
  gulp
    .src(['fonts/**/*.{woff,woff2}', 'img/**', '*.html', 'sounds/*.mp3'], {
      base: '.'
    })
    .pipe(gulp.dest('build'));

  done();
});

gulp.task('clean', () => del('build'));

gulp.task('style', (done) => {
  gulp
    .src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());

  done();
});

let cache = false;
gulp.task('scripts', (done) => {
  rollup({
      input: './js/index.js',
      sourcemap: true,
      format: 'iife',
      plugins: [
        babel({
          exclude: 'node_modules/**',
          presets: [
            ['@babel/env', {
              modules: false
            }]
          ]
        })
      ],
      cache: cache
    })
    .on('bundle', (bundle) => {
      cache = bundle;
    })
    .pipe(plumber())
    .pipe(source('index.js', './js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(rename('script.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));

  done();
});

gulp.task('images', (done) => {
  gulp
    .src('build/img/**/*.{png,jpg,gif}')
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true
        }),
        imagemin.jpegtran({
          progressive: true
        }),
        imagemin.optipng({
          optimizationLevel: 3
        })
      ])
    )
    .pipe(gulp.dest('build/img'));

  done();
});

gulp.task('symbols', (done) => {
  gulp
    .src('build/img/icons/*.svg')
    .pipe(svgmin())
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $('svg').attr('style', 'display:none');
          $('[fill]').removeAttr('fill');
        },
        parserOptions: {
          xmlMode: true
        }
      })
    )
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest('build/img'));

  done();
});

gulp.task('svgSprite', (done) => {
  gulp
    .src('img/icons/*.svg') // svg files for sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg" //sprite file name
        }
      },
    }))
    .pipe(gulp.dest('build/img'));

    done();
});

gulp.task('html:copy', (done) => {
  gulp.src('*.html').pipe(gulp.dest('build'));
  done();
});

gulp.task('html:update', gulp.series('html:copy'), (done) => {
  server.reload();
  done();
});

gulp.task('server', () => {
  server.init({
    server: {
      baseDir: './build'
    },
    tunnel: false,
    host: 'localhost',
    port: 9000
  });

  gulp.watch('sass/**/*.{scss,sass}', gulp.parallel('style'));
  gulp.watch('js/*.js', gulp.parallel('scripts'));
  gulp.watch('*.html', gulp.parallel('html:update'));
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    'copy',
    gulp.parallel('style', 'scripts', 'images', 'symbols', 'svgSprite')
  )
);
