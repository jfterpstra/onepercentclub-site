/**
 *  Router Map
 */

App.Router.map(function(){
    this.resource('partner', {path: '/pp/:partner_id'}, function(){
        this.route('index', {path: '/'});
        this.route('projects', {path: '/projects'});
    });
});

App.PartnerRoute = Em.Route.extend(App.SubMenuMixin, {
    beforeModel: function (transition) {
        var partner_id = transition.params.partner_id;

        this.set('partner_id', partner_id);
        this.set('subMenu', partner_id + '/menu');
    },

    model: function (params, transition) {
        return App.Partner.find(params.partner_id);
    }
});


App.PartnerIndexRoute = Em.Route.extend({
    model: function (params, transition) {
        return this.modelFor('partner');
    },

    actions: {
        partnerProject: function () {
            this.transitionTo('myProject', 'pp:' + this.modelFor('partner').get('id'));
        }
    }
});


App.PartnerProjectsRoute = Em.Route.extend(App.ScrollToTop, {
    model: function (params, transition) {
        return this.modelFor('partner');
    }

});