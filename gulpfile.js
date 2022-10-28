
//   _  _   _ _                               _        __ _ _         _     
//  | || | | (_)_ __   ___  ___    __ _ _   _| |_ __  / _(_) | ___   (_)___ 
//  | || |_| | | '_ \ / _ \/ _ \  / _` | | | | | '_ \| |_| | |/ _ \  | / __|
//  |__   _| | | | | |  __/  __/ | (_| | |_| | | |_) |  _| | |  __/_ | \__ \
//     |_| |_|_|_| |_|\___|\___|  \__, |\__,_|_| .__/|_| |_|_|\___(_)/ |___/
//                                |___/        |_|                 |__/                       


const gulp              = require('gulp');
let gulpConfig          = null;

const gulpTwig 		    = require('gulp-twig');
const yaml			    = require('js-yaml');
const gulpHtmlbeautify  = require('gulp-html-beautify')
const gulpHtmlmin       = require('gulp-htmlmin');

const gulpSass          = require('gulp-sass')(require('sass'));
const gulpBulkSass      = require('gulp-sass-bulk-import');
const gulpSourcemaps    = require('gulp-sourcemaps');
const gulpAutoprefixer  = require('gulp-autoprefixer');
const gulpCssNano       = require('gulp-cssnano');
const cssBeautify       = require('gulp-cssbeautify')

const gulpImagemin      = require('gulp-imagemin');
const gulpSvgSymbols    = require('gulp-svg-symbols');
const gulpSvgmin        = require('gulp-svgmin');

const gulpRollup        = require('gulp-better-rollup');
const rollupBabel       = require('rollup-plugin-babel');
const rollupResolve     = require('rollup-plugin-node-resolve');
const rollupCommonjs    = require('rollup-plugin-commonjs');
const gulpTerser        = require('gulp-terser');
const gulpUglify        = require('gulp-uglify');

const gulpIf		    = require('gulp-if');
const gulpRename	    = require('gulp-rename');
const gulpNotify        = require('gulp-notify');
const gulpConcat        = require('gulp-concat');
const fs			    = require('fs');
const { promisify }     = require('util');
const readFile 		    = promisify(fs.readFile);
const del               = require('del');
const ansi			    = require('ansi-colors');

const browserSync       = require('browser-sync').create();

/* **************** */
/* Check parameters */
/* **************** */

const isProd = process.argv.indexOf('--prod') >= 0;

/* ********** */
/* Print info */
/* ********** */

console.log('');
console.log(ansi.blue('* ---------------------- *'));
console.log(ansi.blue('* ') + ansi.white.bgCyan.bold.italic('  4Linee gulpfile.js  ') + ansi.blue(' *'));
console.log(ansi.blue('* ---------------------- *'));
console.log('');
console.log('Production env:    ' + ansi.cyan(isProd));


if(fs.existsSync('./gulp-config.yml')) {
    gulpConfig = yaml.load(fs.readFileSync('./gulp-config.yml', 'utf8'));
    console.log('Reading config:    ' + ansi.cyan('OK'));
} else {
    console.log('Reading config:    ' + ansi.red('KO'));
    console.log(ansi.red('Missing configuration file (gulp-config.yml)'));
    console.log('');
    return;
}

// -----------
// Clean task 
// -----------
// It removes all compiled assets

function clean() {
    return del(gulpConfig.assets.dest, { force: true });
} 

// ----------
// Twig task 
// ----------
// It compiles all twig files (first level pages inside twig dir)
// and generate corresponding html pages
// If _data.data.yml exists, it resolves variables inside twig files
// In dev mode it provides final html beautify
// In prod mode the final html is minified

function twig() {

    let ymlData = false;

    if(fs.existsSync(gulpConfig.twig.data)) {
        ymlData = yaml.load(fs.readFileSync(gulpConfig.twig.data, 'utf8'));
    }

    return gulp.src(gulpConfig.twig.files)
                .pipe(gulpIf(ymlData, gulpTwig({ base: gulpConfig.twig.src, data: ymlData })
                    .on('error', gulpNotify.onError({
                        message: "\n\nSource file: <%= error.message %>",
                        title: "Twig compiling error"
                    }))
                ))
                .pipe(gulpIf(!ymlData, gulpTwig({ base: gulpConfig.twig.src })
                    .on('error', gulpNotify.onError({
                        message: "\n\nSource file: <%= error.message %>",
                        title: "Twig compiling error"
                    }))
                ))
                .pipe(gulpHtmlbeautify())
                .pipe(gulpIf(isProd, gulpHtmlmin({
                    collapseWhitespace: true
                })))
                .pipe(gulp.dest(gulpConfig.twig.dest));
}


// -----------
// Scss task 
// -----------
// It compiles all scss files into a unique css file
// providing prefixing for crossbrowser compatibility
// In dev mode it provides sourcemaps and final css beautify
// In prod mode no sourcemap is provided and the final css is minified

function scss() {
    return gulp.src(gulpConfig.scss.files)
                .pipe(gulpBulkSass())
                .pipe(gulpIf(!isProd, gulpSourcemaps.init()))
                .pipe(gulpSass({ includePaths: ['node_modules'] })
                    .on('error', gulpNotify.onError({
                        message: "\n\nSource file: <%= error.message %>",
                        title: "Scss compiling error"
                    }))
                )
                .pipe(gulpAutoprefixer('last 7 versions'))
                .pipe(cssBeautify({
                    indent: '  ',
                    openbrace: 'separate-line',
                    autosemicolon: true
                }))
                .pipe(gulpIf(isProd, gulpCssNano()))
                .pipe(gulpIf(!isProd, gulpSourcemaps.write('./maps')))
                .pipe(gulp.dest(gulpConfig.scss.dest));
}

// -----------
// Images task 
// -----------
// After compression it moves all the images to the assets dir
// The src/images/svg directory is excluded

function images() {
    return gulp.src(gulpConfig.images.files)
                .pipe(gulpImagemin([
                    gulpImagemin.gifsicle({ interlaced: true }),
                    gulpImagemin.mozjpeg({ quality: 75, progressive: true }),
                    gulpImagemin.optipng({ optimizationLevel: 5 }),
                    gulpImagemin.svgo({
                        plugins: [
                            { cleanupIDs: false },
                            { inlineStyles: true },
                            { removeHiddenElems: false },
                            { removeUselessDefs: false },
                            { removeViewBox: false }
                        ]
                    })
                ]))
                .pipe(gulp.dest(gulpConfig.images.dest));
}

// ----------------
// Svg symbols task 
// ----------------
// It takes all the svg files from the src dir and 
// generate a unique svg file including all the previuos ones
// as symbols

function svgs() {
    return gulp.src(gulpConfig.svgs.src)
                .pipe(gulpSvgmin())
                .pipe(gulpSvgSymbols({
                    templates: [ 'default-svg' ],
                    svgAttrs: { class: 'svg-symbols' }
                }))
                .pipe(gulp.dest(gulpConfig.svgs.dest))
}

// -------------
// Js task (ES6)
// -------------
// It transpiles all ES6 js files into a unique js file
// In dev mode it provides sourcemaps
// In prod mode no sourcemap is provided and the final css is minified

function js() {
    return gulp.src(gulpConfig.scripts.files)
                .pipe(gulpIf(!isProd, gulpSourcemaps.init()))
                .pipe(gulpRollup({ plugins: [rollupBabel(), rollupResolve(), rollupCommonjs()] }, 'umd')
                    .on('error', gulpNotify.onError({
                        message: "\n\nSource file: <%= error.message %>",
                        title: "Js compiling error"
                    }))
                )
                .pipe(gulpConcat('main.min.js'))
                .pipe(gulpTerser({ mangle: false, ecma: 6 }))
                .pipe(gulpIf(!isProd, gulpSourcemaps.write('maps')))
                .pipe(gulp.dest(gulpConfig.scripts.dest))
}

// -----------
// Static task 
// -----------
// It copies all files and folders inside static dir
// directly into the assets dist folder
// It has to be used for fonts, json files and similar

function static() {
    return gulp.src(gulpConfig.static.dirs)
                .pipe(gulp.dest(gulpConfig.static.dest))
}

// ------------
// Vendor tasks
// ------------
// It compiles all css, scss and js files inside the vendors dir
// generating two separate files for vendor style and script

function vendorsScss() {
    return gulp.src(gulpConfig.vendors.filesStyle)
                .pipe(gulpSass())
                .pipe(gulpIf(isProd, gulpCssNano()))
                .pipe(gulpConcat('vendors.css'))
                .pipe(gulp.dest(gulpConfig.vendors.dest));
}

function vendorsJs() {
    return gulp.src(gulpConfig.vendors.filesScript)
                .pipe(gulpConcat('vendors.min.js'))
                .pipe(gulpIf(isProd, gulpUglify()))
                .pipe(gulp.dest(gulpConfig.vendors.dest));
}


// -----------
// Watch tasks 
// -----------
// Waits for mods, recompiles and reload the browser

function serve() {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        startPath: '/',
        'ghostMode': false
    });
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}

function watchFiles() {
    gulp.watch(gulpConfig.twig.watch, gulp.series(twig, browserSyncReload));
    gulp.watch(gulpConfig.scss.watch, gulp.series(scss, browserSyncReload));
    gulp.watch(gulpConfig.scripts.watch, gulp.series(js, browserSyncReload));
    gulp.watch(gulpConfig.images.files, gulp.series(images, browserSyncReload));
    gulp.watch(gulpConfig.svgs.src, gulp.series(svgs, twig, browserSyncReload));
    gulp.watch(gulpConfig.static.dirs, gulp.series(static, browserSyncReload));
    gulp.watch(gulpConfig.vendors.filesStyle, gulp.series(vendorsScss, browserSyncReload));
    gulp.watch(gulpConfig.vendors.filesScript, gulp.series(vendorsJs, browserSyncReload));

    return;
}


// ------------
// Export tasks 
// ------------

exports.clean = clean;
exports.twig = twig;
exports.scss = scss;
exports.images = images;
exports.svgs = svgs;
exports.js = js;
exports.vendors = gulp.parallel(vendorsScss, vendorsJs);
exports.static = static;
exports.watch = gulp.parallel(twig, scss, js, images, svgs, static, vendorsScss, vendorsJs, watchFiles, serve);
exports.default = gulp.series(clean, svgs, scss, js, images, twig, static, vendorsScss, vendorsJs);

console.log('');
