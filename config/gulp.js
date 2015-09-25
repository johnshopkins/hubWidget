module.exports = {

  js: {

    compile: { src: ["./src/assets/js/*.js"] },
    hint: { jshintrc: "./config/jshintrc.json" },
    build: "./build/js",
    dist: "./dist/js"

  },

  scss: {

    lint: "./config/csslintrc.rc",
    src: ["./src/assets/css/*.scss"],
    build: "./build/css",
    dist: "./dist/css"

  },

  move: [
    {
      src: "./src/assets/images/**/*",
      build: "./build/images",
      dist: "./dist/images"
    }
  ],

};
