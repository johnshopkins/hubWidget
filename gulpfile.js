// node modules
var gulp = require("gulp");
var Tasker = require("gulp-tasks");

// configuration
var config = require("./config/gulp");


// setup gulp tasker
var gulpTasker = new Tasker(gulp);
gulpTasker.setConfig(config);

// add tasks
gulp.tasks = gulpTasker
  .add("js")
  .add("scss")
  .add("move")
  .get();


// create our tasks

// compile all files when running `gulp`
gulp.task("default", ["default:js", "default:scss", "default:move"]);

// after running `gulp watch`, compile all files and watch for changes
gulp.task("watch", ["default"], function () {
  gulp.watch(["./src/assets/js/**/*.js"], ["default:js"]);
  gulp.watch(["./src/assets/css/**/*.scss"], ["default:scss"]);
});
