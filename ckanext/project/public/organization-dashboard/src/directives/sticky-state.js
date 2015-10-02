
OrganizationDashboardApp.directive("stickyState", function($state, uirextras_core) {
    var objectKeys = uirextras_core.objectKeys;
    return {
        restrict: 'EA',
        compile: function(tElem, tAttrs) {
            var stateName = tAttrs.stickyState || tAttrs.state;
            if (!stateName) {
                throw new Error("Sticky state name must be supplied to stickyState directive.  " +
                    "Either <sticky-state state='my.sticky.state' /> or <div sticky-state='my.sticky.state'></div>");
            }

            var state = $state.get(stateName);
            if (!state) {
                throw new Error("Could not find the supplied state: '" + stateName + "'");
            }

            if (!angular.isObject(state.views)) {
                throw new Error("The supplied state: '" + stateName + "' must have a named view declared, i.e., " +
                    ".state('" + state.name + "', { views: { stickyView: { controller: myCtrl, templateUrl: 'myTemplate.html' } } });");
            }
            var keys = objectKeys(state.views);
            if (keys.length != 1) {
                throw new Error("The supplied state: '" + stateName + "' must have exactly one named view declared.");
            }

            tElem.append('<div ui-view="' + keys[0] + '"></div>');

            return function(scope, elem, attrs) {
                var autohideDiv = scope.$eval(attrs.autohide);
                autohideDiv = angular.isDefined(autohideDiv) ? autohideDiv : true;

                if (autohideDiv) {
                    scope.$on("$stateChangeSuccess", function stateChanged() {
                        var addOrRemoveFnName = $state.includes(state) ? "removeClass" : "addClass";
                        elem[addOrRemoveFnName]("ng-hide");
                    });
                }
            }
        }
    }
});
