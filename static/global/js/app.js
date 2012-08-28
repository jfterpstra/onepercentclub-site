App = Em.Application.create({
  rootElement : '#content',
  
  updateRouter: function() {
    var router = this.router;    
    //var states = this.get(router, 'states'), foundStates;
    console.log(router);
    for (name in states) {
      console.log(states[name]);
      this.setupChild(states, name, states[name]);
    }
    
    
    console.log('Don\'t know how to update the router, yet....')
    var router = this.get('router');
    router.init();
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
  }),

});

/* Routing */

// Set basic Project route
App.ProjectRoute = Em.Route.extend({
    route : '/projects',
    connectOutlets : function(router, event) {
    	require(['app/projects'], function(){
        router.get('applicationController').connectOutlet('topPanel', 'projectHome');
        router.get('applicationController').connectOutlet('midPanel', 'projectSearchForm');
        router.get('applicationController').connectOutlet('bottomPanel', 'projectSearchResults');
    	});
    	
    }
 });
  
  
App.RootRoute =  Em.Route.extend({
  // Used for navigation
  gotoHome : function(router, event) {
    router.transitionTo('home');
  },
  gotoProjects : function(router, event) {
    router.transitionTo('projects');
  },
  // The actual routing
  home : Em.Route.extend({
    route : '/',
    connectOutlets : function(router, event) {
      router.get('applicationController').connectOutlet('topPanel', 'home');
      router.get('applicationController').connectOutlet('midPanel', 'empty');
      router.get('applicationController').connectOutlet('bottomPanel', 'empty');
      }
    }),
  projects : App.ProjectRoute
});
 
  
 
App.Router = Em.Router.extend({
  root : App.RootRoute
});

$(function() {
  App.initialize();
});

