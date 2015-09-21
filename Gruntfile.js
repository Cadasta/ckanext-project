module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ngconstant: {
			// Options for all targets
			options: {
				name: 'app.config',
			},
			// Environment targets
			development: {
				options: {
					dest: 'ckanext/project/public/src/config.js'
				},
				constants: {
					ENV: {
						name: 'development',
						apiRoot: 'http://localhost:9000'
					}
				}
			},
			staging: {
				options: {
					dest: 'ckanext/project/public/src/config.js'
				},
				constants: {
					ENV: {
						name: 'staging',
						apiRoot: 'http://54.69.121.180:3000'
					}
				}
			},
			demo: {
				options: {
					dest: 'ckanext/project/public/src/config.js'
				},
				constants: {
					ENV: {
						name: 'demo',
						apiRoot: 'http://54.69.121.180:3001'
					}
				}
			},
			production: {
				options: {
					dest: 'ckanext/project/public/src/config.js'
				},
				constants: {
					ENV: {
						name: 'production',
						apiRoot: 'http://54.69.121.180:3000/'
					}
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-ng-constant');

	grunt.registerTask('default', []);
};