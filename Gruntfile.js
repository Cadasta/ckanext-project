module.exports = function(grunt) {

	var env = grunt.option('env') || 'staging';

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

		cachebreaker: {
			dev: {
				options: {
					match: ["app.min.js", "app.min.css"],
				},
				files: {
					src: ['ckanext/project/templates/project/read_base.html']
				}
			}
		},

		uglify: {
			options: {
				mangle: false
			},
			dev: {
				options: {
					sourceMap: true,
					sourceMapName: function(){
						return 'ckanext/project/public/build/app.min.map';
					}
				},
				files: {
					'ckanext/project/public/build/app.min.js': [
						"ckanext/project/public/src/config.js",
						"ckanext/project/public/src/modules/params-manager.js",
						"ckanext/project/public/src/app.js",
						"ckanext/project/public/src/services/dataService.js",
						"ckanext/project/public/src/services/mapUtilityService.js",
						"ckanext/project/public/src/services/utilityService.js",
						"ckanext/project/public/src/services/parcelService.js",
						"ckanext/project/public/src/services/onaService.js",
						"ckanext/project/public/src/services/uploadResourceService.js",
						"ckanext/project/public/src/controllers/project-overview.js",
						"ckanext/project/public/src/controllers/project-parcels.js",
						"ckanext/project/public/src/controllers/project-parcel.js",
						"ckanext/project/public/src/controllers/project-map.js",
						"ckanext/project/public/src/controllers/project-resources.js",
						"ckanext/project/public/src/controllers/project-activity_list.js",
						"ckanext/project/public/src/controllers/tabs.js",
						"ckanext/project/public/src/controllers/project-header.js",
						"ckanext/project/public/src/controllers/breadcrumbs.js",
						"ckanext/project/public/src/controllers/field-data.js",
						"ckanext/project/public/src/directives/sticky-state.js",
						"ckanext/project/public/src/other_scripts/custom_jquery.js"
					]
				}
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			dev: {
				files: {
					'ckanext/project/public/build/app.min.css': ["ckanext/project/public//styles/style.css",
						"ckanext/project/public//styles/breadcrumbs.css",
						"ckanext/project/public//styles/parcels.css",
						"ckanext/project/public//styles/tabs.css",
						"ckanext/project/public//styles/project_overview.css",
						"ckanext/project/public//styles/project-map-tab.css",
						"ckanext/project/public//styles/activity_resources_tab.css",
						"ckanext/project/public//styles/material-design-icons.css"]
				}
			}
		},

		watch: {
			code: {
				files: ['ckanext/project/public/src/**', 'ckanext/project/public/styles/**'],
				tasks: ['build'],
				options: {
					spawn: false,
				},
			},
		}

	});

	grunt.loadNpmTasks('grunt-ng-constant');
	grunt.loadNpmTasks('grunt-cache-breaker');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', []);

	grunt.registerTask('build', ['ngconstant:' + env,'uglify:dev', 'cssmin:dev', 'cachebreaker:dev']);
};