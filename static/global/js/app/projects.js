
/*
 Models
 */


App.Organization = DS.Model.extend({
    url: 'organizations',
    name: DS.attr('string'),
    description: DS.attr('string', {defaultValue: ""}),

    // Internet
    website: DS.attr('string', {defaultValue: ""}),
    facebook: DS.attr('string', {defaultValue: ""}),
    twitter: DS.attr('string', {defaultValue: ""}),
    skype: DS.attr('string', {defaultValue: ""}),

    // Legal
    legalStatus: DS.attr('string', {defaultValue: ""}),
});


App.ProjectCountry = DS.Model.extend({
    name: DS.attr('string'),
    subregion: DS.attr('string')
});


App.ProjectPitch = DS.Model.extend({
    url: 'projects/pitches',

    project: DS.belongsTo('App.MyProject'),
    created: DS.attr('date'),
    status: DS.attr('string'),

    // Basics
    title: DS.attr('string'),
    pitch: DS.attr('string'),
    theme: DS.attr('string'),
    tags: DS.hasMany('App.Tag'),
    description: DS.attr('string'),
    need: DS.attr('string'),

    // Location
    country: DS.belongsTo('App.ProjectCountry'),
    latitude: DS.attr('string'),
    longitude: DS.attr('string'),

    // Media
    image: DS.attr('string'),
    image_small: DS.attr('string'),
    image_square: DS.attr('string'),
    image_bg: DS.attr('string')

});


App.ProjectPlan = DS.Model.extend({
    url: 'projects/plans',

    project: DS.belongsTo('App.MyProject'),
    status: DS.attr('string'),
    created: DS.attr('date'),

    // Basics
    title: DS.attr('string'),
    pitch: DS.attr('string'),
    theme: DS.belongsTo('App.Theme'),
    need: DS.attr('string'),
    tags: DS.hasMany('App.Tag'),

    // Description
    description: DS.attr('string'),
    effects: DS.attr('string'),
    future: DS.attr('string'),
    for_who: DS.attr('string'),
    reach: DS.attr('number'),

    // Location
    country: DS.belongsTo('App.ProjectCountry'),
    latitude: DS.attr('string'),
    longitude: DS.attr('string'),

    // Media
    image: DS.attr('image'),

    // Organization
    organization: DS.belongsTo('App.Organization')

});


App.ProjectCampaign = DS.Model.extend({
    url: 'projects/plans',

    project: DS.belongsTo('App.MyProject'),
    status: DS.attr('string'),
    money_asked: DS.attr('number'),
    money_donated: DS.attr('number'),

    money_needed: function(){
        var donated = this.get('money_asked') - this.get('money_donated');
        if (donated < 0) {
            return 0;
        }
        return Math.ceil(donated);
    }.property('money_asked', 'money_donated')
});


App.Project = DS.Model.extend({
    url: 'projects/projects',

    // Model fields
    slug: DS.attr('string'),
    title: DS.attr('string'),
    phase: DS.attr('string'),
    created: DS.attr('date'),

    plan: DS.belongsTo('App.ProjectPlan'),
    campaign: DS.belongsTo('App.ProjectCampaign'),

    owner: DS.belongsTo('App.UserPreview'),
    coach: DS.belongsTo('App.UserPreview'),

    days_left: DS.attr('number'),
    supporters_count: DS.attr('number'),

    wallposts: DS.hasMany('App.WallPost')
});


App.ProjectPreview = App.Project.extend({
    url: 'projects/previews',
    image: DS.attr('string')
});


App.ProjectSearch = DS.Model.extend({

    text: DS.attr('string'),
    country: DS.attr('number'),
    theme:  DS.attr('number'),
    orderBy: DS.attr('string', {defaultValue: 'title'}),
    phase: DS.attr('string', {defaultValue: 'campaign'}),
    page: DS.attr('number', {defaultValue: 1})

})

/*
 Controllers
 */


App.ProjectListController = Em.ArrayController.extend({
    needs: ['projectSearchForm'],
    hasNextPage: function(){
        return (this.get('model.length') == 8);
    }.property('model.length'),
    hasPreviousPage: function(){
        return (this.get('page') > 1);
    }.property('page'),
    // TODO: Make a binding for this to App.ProjectSearchFormController.page
    page: 1,
    nextPage: function(){
        this.incrementProperty('page');
        this.set('controllers.projectSearchForm.page', this.get('page'));
    },
    previousPage: function(){
        this.decrementProperty('page');
        this.set('controllers.projectSearchForm.page', this.get('page'));
    }

});


App.ProjectSearchFormController = Em.ObjectController.extend({
    needs: ['projectList'],
    init: function(){
        var form =  App.ProjectSearch.createRecord();
        this.set('model', form);
    },
    updateSearch: function(sender, key){
        if (key != 'page') {
            // If the query changes we should jump back to page 1
            this.set('page', 1);
            // TODO: Make a binding for this
            this.set('controllers.projectList.page', 1);
        }
        if (this.get('model.isDirty') ) {
            var list = this.get('controllers.projectList');
            var query = {
                'page': this.get('page'),
                'phase': this.get('phase'),
                'country': this.get('country'),
                'text': this.get('text'),
                'theme': this.get('theme')
            };
            list.set('model', App.ProjectPreview.find(query));
        }
    }.observes('text', 'country', 'theme', 'phase', 'page')

});


App.ProjectController = Em.ObjectController.extend({
    isFundable: function(){
        return this.get('phase') == 'campaign';
    }.property('phase')

});


App.ProjectSupporterListController = Em.ArrayController.extend({
    supportersLoaded: function(sender, key) {
        if (this.get(key)) {
            this.set('model', this.get('supporters').toArray());
        } else {
            // Don't show old content when new content is being retrieved.
            this.set('model', null);
        }
    }.observes('supporters.isLoaded')

});


/*
 Views
 */

App.ProjectMembersView = Em.View.extend({
    templateName: 'project_members'
});

App.ProjectSupporterView = Em.View.extend({
    templateName: 'project_supporter',
    tagName: 'li',
    didInsertElement: function(){
        this.$('a').popover({trigger: 'hover', placement: 'top', width: '100px'})
    }
});


App.ProjectSupporterListView = Em.View.extend({
    templateName: 'project_supporter_list'
});


App.ProjectListView = Em.View.extend({
    templateName: 'project_list'
});


App.ProjectSearchFormView = Em.View.extend({
    templateName: 'project_search_form'
});


App.ProjectPlanView = Em.View.extend({
    templateName: 'project_plan',

    staticMap: function(){
        var latlng = this.get('controller.latitude') + ',' + this.get('controller.longitude');
        return "http://maps.googleapis.com/maps/api/staticmap?" + latlng + "&zoom=8&size=600x300&maptype=roadmap" +
            "&markers=color:pink%7Clabel:P%7C" + latlng + "&sensor=false";
    }.property('latitude', 'longitude')
});


App.ProjectView = Em.View.extend({
    templateName: 'project',

    didInsertElement: function(){
        this.$('#detail').css('background', 'url("' + this.get('controller.image_bg') + '") 50% 50%');
        this.$('#detail').css('background-size', '100%');

        // TODO: The 50% dark background doesn't work this way. :-s
        this.$('#detail').css('backgroundColor', 'rgba(0,0,0,0.5)');

        var donated = this.get('controller.campaign.money_donated');
        var asked = this.get('controller.campaign.money_asked');
        this.$('.donate-progress').css('width', '0px');
        var width = 0;
        if (asked > 0) {
            width = 100 * donated / asked;
            width += '%';
        }
        this.$('.donate-progress').animate({'width': width}, 1000);
    }
});

