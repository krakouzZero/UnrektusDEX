module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
        style: 'expanded'
      },
      dist: {
        files: {
          'css/styles.css': 'src/sass/theme.scss'
        }
      }
    },
    postcss: {
      options: {
          map: false,
          processors: [
              require('autoprefixer')()
          ]
      },
      dist: {
          src: 'css/*.css'
      }
    },
    cssmin: {
     target: {
      files: {
        'css/styles.min.css': ['css/styles.css']
        }
      }
    },
    concat: {
      js: {
        files: {
          'js/footer-scripts.js': ['src/js/footer/*.js']
        },
      },
    },
    uglify: {
      my_target: {
        files: {
          'js/footer-scripts.min.js': ['js/footer-scripts.js']
        }
      }
    },
    watch: {
     scripts: {
       files: ['src/js/**/*.js', 'src/sass/*.scss'],
       tasks: ['sass', 'postcss', 'cssmin', 'concat', 'uglify'],
       options: {
         spawn: false,
       },
     },
    }


  });

  // Load the plugin that provides the tasks.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', [
    'sass',
    'postcss',
    'cssmin',
    'concat',
    'uglify',
    'watch'
  ]);

  grunt.registerTask('build', [
    'sass',
    'postcss',
    'cssmin',
    'concat',
    'uglify',
  ]);
};
