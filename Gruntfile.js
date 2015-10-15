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
					dest: 'ckanext/project/public/shared/src/config.js'
				},
				constants: {
					ENV: {
						name: 'development',
						apiCadastaRoot: 'http://localhost:9000',
						apiCKANRoot: 'http://localhost:5000/api/3/action'
					}
				}
			},
			staging: {
				options: {
					dest: 'ckanext/project/public/shared/src/config.js'
				},
				constants: {
					ENV: {
						name: 'staging',
						apiCadastaRoot: 'http://54.69.121.180:3000',
						apiCKANRoot: 'http://cadasta-staging.spatialdevmo.com/api/3/action'
					}
				}
			},
			local_staging: {
				options: {
					dest: 'ckanext/project/public/shared/src/config.js'
				},
				constants: {
					ENV: {
						name: 'staging',
						apiCadastaRoot: 'http://54.69.121.180:3000',
						apiCKANRoot: 'http://localhost:5000/api/3/action'
					}
				}
			},
			demo: {
				options: {
					dest: 'ckanext/project/public/shared/src/config.js'
				},
				constants: {
					ENV: {
						name: 'demo',
						apiCadastaRoot: 'http://54.69.121.180:3001',
						apiCKANRoot: 'http://cadasta-demo.spatialdevmo.com/api/3/action'
					}
				}
			},
			production: {
				options: {
					dest: 'ckanext/project/public/shared/src/config.js'
				},
				constants: {
					ENV: {
						name: 'production',
						apiCadastaRoot: 'http://54.69.121.180:3000',
						apiCKANRoot: 'http://cadasta-staging.spatialdevmo.com/api/3/action'
					}
				}
			}
		},

		cachebreaker: {
			projectDashboard: {
				options: {
					match: ["project-dashboard-app.min.js", "project-dashboard-app.min.css"],
				},
				files: {
					src: ['ckanext/project/templates/project/read_base.html']
				}
			},

			organizationDashboard: {
				options: {
					match: ["organization-dashboard-app.min.js", "organization-dashboard-app.min.css"],
				},
				files: {
					src: ['ckanext/project/templates/organization/read_base.html']
				}
			}
		},

		uglify: {
			options: {
				mangle: false
			},
			projectDashboard: {
				options: {
					sourceMap: true,
					sourceMapName: function(){
						return 'ckanext/project/public/build/project-dashboard-app.min.map';
					}
				},
				files: {
					'ckanext/project/public/build/project-dashboard-app.min.js': [
						"ckanext/project/public/shared/src/config.js",
						"ckanext/project/public/shared/src/modules/params-manager.js",
						"ckanext/project/public/project-dashboard/src/project-dashboard-app.js",
						"ckanext/project/public/project-dashboard/src/services/dataService.js",
						"ckanext/project/public/project-dashboard/src/services/mapUtilityService.js",
						"ckanext/project/public/shared/src/services/utilityService.js",
						"ckanext/project/public/project-dashboard/src/services/parcelService.js",
						"ckanext/project/public/shared/src/services/onaService.js",
						"ckanext/project/public/project-dashboard/src/services/uploadResourceService.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-overview.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-parcels.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-parcel.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-map.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-resources.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-activity_list.js",
						"ckanext/project/public/project-dashboard/src/controllers/tabs.js",
						"ckanext/project/public/project-dashboard/src/controllers/project-header.js",
						"ckanext/project/public/project-dashboard/src/controllers/breadcrumbs.js",
						"ckanext/project/public/project-dashboard/src/controllers/field-data.js",
						"ckanext/project/public/shared/src/directives/sticky-state.js",
						"ckanext/project/public/shared/src/other_scripts/custom_jquery.js",
						"ckanext/project/public/project-dashboard/src/other_scripts/custom_jquery.js"
					]
				}
			},
			organizationDashboard: {
				options: {
					sourceMap: true,
					sourceMapName: function(){
						return 'ckanext/project/public/build/organization-dashboard-app.min.map';
					}
				},
				files: {
					'ckanext/project/public/build/organization-dashboard-app.min.js': [
						"ckanext/project/public/shared/src/config.js",
						"ckanext/project/public/organization-dashboard/src/modules/params-manager.js",
						"ckanext/project/public/organization-dashboard/src/organization-dashboard-app.js",
						"ckanext/project/public/organization-dashboard/src/services/dataService.js",
						"ckanext/project/public/organization-dashboard/src/controllers/tabs.js",
						"ckanext/project/public/organization-dashboard/src/controllers/organization-header.js",
						"ckanext/project/public/organization-dashboard/src/controllers/organization-overview.js",
						"ckanext/project/public/organization-dashboard/src/controllers/organization-members.js",
						"ckanext/project/public/organization-dashboard/src/controllers/breadcrumbs.js",
						"ckanext/project/public/organization-dashboard/src/directives/sticky-state.js",
						"ckanext/project/public/shared/src/other_scripts/custom_jquery.js",
						"ckanext/project/public/organization-dashboard/src/other_scripts/custom_jquery.js"

					]
				}
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			projectDashboard: {
				files: {
					'ckanext/project/public/build/project-dashboard-app.min.css': [
						"ckanext/project/public/shared/styles/style.css",
						"ckanext/project/public/shared/styles/breadcrumbs.css",
						"ckanext/project/public/shared/styles/ckanext_project.css",
						"ckanext/project/public/shared/styles/material-design-icons.css",
						"ckanext/project/public/shared/styles/tabs.css",
						"ckanext/project/public/project-dashboard/styles/parcels.css",
						"ckanext/project/public/project-dashboard/styles/project_overview.css",
						"ckanext/project/public/project-dashboard/styles/project-map-tab.css",
						"ckanext/project/public/project-dashboard/styles/activity_resources_tab.css"]
				}
			},
			organizationDashboard: {
				files: {
					'ckanext/project/public/build/organization-dashboard-app.min.css': [
						"ckanext/project/public/shared/styles/style.css",
						"ckanext/project/public/organization-dashboard/styles/org-overview.css",
						"ckanext/project/public/shared/styles/breadcrumbs.css",
						"ckanext/project/public/shared/styles/ckanext_project.css",
						"ckanext/project/public/shared/styles/material-design-icons.css",
						"ckanext/project/public/shared/styles/tabs.css"]
				}
			}
		},

		watch: {
			code: {
				files: [
					'ckanext/project/public/shared/src/**',
					'ckanext/project/public/shared/styles/**',
					'ckanext/project/public/organization-dashboard/src/**',
					'ckanext/project/public/organization-dashboard/styles/**',
					'ckanext/project/public/project-dashboard/src/**',
					'ckanext/project/public/project-dashboard/styles/**'
				],
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

	grunt.registerTask('build', ['ngconstant:' + env,'uglify:projectDashboard','uglify:organizationDashboard', 'cssmin:projectDashboard','cssmin:organizationDashboard', 'cachebreaker:projectDashboard', 'cachebreaker:organizationDashboard']);
};