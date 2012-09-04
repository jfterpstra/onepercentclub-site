App = Em.Application.create({
    rootElement : '#content',

    updateRouter : function() {
        var router = this.get('router');
        router.init();
        console.log(router)
        console.log('Don\'t know how to update the router, yet....')
    },

    // Define the main application controller. This is automatically picked up by
    // the application and initialized.
    ApplicationController : Em.Controller.extend({
    }),

    ApplicationView : Em.View.extend({
        templateName : 'application'
    }),

    // Use this to clear an outlet
    EmptyView : Em.View.extend({
        template : ''
    }),

    /* Home */
    HomeView : Em.View.extend({
        templateName : 'home'
    })

});

/* Routing */

// Set basic Project route
App.ProjectRoute = Em.Route.extend({
    route: '/projects',

    showProjectDetail: Em.Route.transitionTo('projects.detail'),
    toggleAdvancedSearch: function(router, event){
        console.log(event);
        var section = $(event.srcElement).parents('.section');
        
        $('.advanced', section).toggleClass('hidden');
        $('.resize a', section).toggleClass('hidden');
        
    },

    connectOutlets : function(router, context) {
        require(['app/projects'], function(){
            router.get('applicationController').connectOutlet('topPanel', 'projectStart');
            router.get('applicationController').connectOutlet('midPanel', 'projectSearchForm');
            router.get('applicationController').connectOutlet('bottomPanel', 'projectSearchResultsSection');
        });
    },

    // The project start state.
    start: Em.Route.extend({
        route: "/"
    }),

    // The project detail state.
    detail: Em.Route.extend({
        route: '/:project_slug',
        changeMediaViewer: function(router, event){
            console.log(event);
        },
        deserialize: function(router, params) {
            return {slug: params.project_slug}
        },
        serialize: function(router, context) {
            return {project_slug: context.slug};
        },
        connectOutlets: function(router, context) {
            require(['app/projects'], function(){
                App.projectDetailController.populate(context.slug);
                router.get('applicationController').connectOutlet('topPanel', 'projectDetail');
            });
        }
    }) 
});

App.RootRoute = Em.Route.extend({
    // Used for navigation
    showHome: Em.Route.transitionTo('home'),

    showProjectStart: Em.Route.transitionTo('projects.start'),

    // Language switching
    switchLanguage : function(router, event) {
        //TODO: implement language switch
        //TODO: Do class switch in a proper Ember way...
        $('a', '.languages').removeClass('active');
        $(event.srcElement).addClass('active');
    },
    // The actual routing
    home: Em.Route.extend({
        route : '/',
        connectOutlets: function(router, context) {
            router.get('applicationController').connectOutlet('topPanel', 'home');
            router.get('applicationController').connectOutlet('midPanel', 'empty');
            router.get('applicationController').connectOutlet('bottomPanel', 'empty');
        }
    }),
    projects: App.ProjectRoute
});

App.Router = Em.Router.extend({
    history: 'hash',
    root: App.RootRoute
});

$(function() {
    App.initialize();
});

