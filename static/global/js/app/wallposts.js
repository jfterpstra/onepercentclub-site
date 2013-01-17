
/*
 Models
 */

// This is union of all different wallposts.
App.ProjectWallPost = DS.Model.extend({
    url: 'projects/wallposts',

    // Model fields
    project_id: DS.attr('number'),
    author: DS.belongsTo('App.Member', {embedded: true}),
    title: DS.attr('string'),
    text: DS.attr('string'),
    created: DS.attr('string'),
    timesince: DS.attr('string'),
    video_url: DS.attr('string'),
    video_html: DS.attr('string'),
    photo: DS.attr('string')
});


App.ProjectMediaWallPost = App.ProjectWallPost.extend({
    url: 'projects/wallposts/media',
    type: 'media'
});

App.ProjectTextWallPost = App.ProjectWallPost.extend({
    url: 'projects/wallposts/text',
    type: 'text'
});


/*
 Controllers
 */

App.projectWallPostListController = Em.ArrayController.create({
    models: {
        'media': App.ProjectMediaWallPost,
        'text': App.ProjectTextWallPost
    },
    
    projectBinding: "App.projectDetailController.content",

    // http://stackoverflow.com/questions/11895629/add-delete-items-from-ember-data-backed-arraycontroller
    // https://github.com/emberjs/data/issues/370
    projectChanged: function(sender, key) {
        // The RecordArray is not loaded into 'content' so that we can use a real ember array
        // for 'content' when it's loaded.
        var projectId = this.get('project.id');
        this.set('tempWallposts', App.ProjectWallPost.find({project_id: projectId}));
    }.observes('project'),

    tempWallpostsLoaded: function(sender, key) {
        // Set 'content' with an ember array when the wallposts have been loaded. This allows
        // us to manually manipulate 'content' when new posts are added.
        if (sender.get(key)) {
            sender.set('content', sender.get('tempWallposts').toArray());
        }
    }.observes('tempWallposts.isLoaded'),


    // Temporary object used as a placeholder for the media, text (or whatever) wallpost model.
    wallpost: new Em.Object(),

    // Add the project_id whenever the wallpost model is updated.
    wallpostChanged: function(sender, key) {
        this.get('wallpost').set('project_id', this.get('project.id'));
    }.observes('wallpost'),

    addWallPost: function() {
        var wallpost = this.get('wallpost');
        // This is not a race condition because ember-data only starts its machinery when App.store.commit() is called.
        wallpost.on('didCreate', function(record) {
            App.projectWallPostListController.get('content').unshiftObject(record);
        });
        App.store.commit();
    }
});


/*
 Views
 */

App.WallPostFormContainerView = Em.View.extend({
    templateName: 'wallpost_form_container',
    templateFile: 'wallpost',

    classNames: ['container', 'section'],
    contentBinding: "App.projectDetailController.content",

    isOwner: function() {
        var user = this.get('user');
        var owner = this.get('content.owner'); 
        if (user && owner && user.get('username')) {
            return user.get('username') == owner.get('username');
        }
        return false;
    }.property('user', 'content.owner')
});


App.MediaWallPostFormView = Em.View.extend({
    templateName: 'media_wallpost_form',
    templateFile: 'wallpost',

    tagName: 'form',
    // Ask Loek: do we want this?
    attributeBindings: ['enctype', 'method'],
    enctype: "multipart/form-data",
    method: "POST",
// action needs to be implemented somehow.
//    action: "/i18n/api/projects/wallposts/media/"


    wallpostBinding: 'App.projectWallPostListController.wallpost',

    init: function() {
        this._super();
        this.set('wallpost', App.ProjectMediaWallPost.createRecord());
    },

    submit: function(e){
        // **** Why is this called when the project page is first loaded? - is it? ******
        e.preventDefault();
        App.projectWallPostListController.addWallPost();
    },

    wallpostChanged: function(sender, key) {
        // Create a new wallpost when it's been successfully saved to the server (isNew == false).
        if (!sender.get(key)) {
            this.set('wallpost', App.ProjectMediaWallPost.createRecord());
        }
    }.observes('wallpost.isNew')
});


App.TextWallPostFormView = App.MediaWallPostFormView.extend({
    templateName: 'text_wallpost_form',
    wallpost: {type: 'text'}
});


App.UploadFileView = Ember.TextField.extend({
    type: 'file',
    attributeBindings: ['name'],
    wallpostBinding: 'App.projectWallPostListController.wallpost',
    change: function(e) {
        var input = e.target;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            var that = this;
            reader.onload = function(e) {
                var mediawallpost = that.get('wallpost');
                mediawallpost.set('photo', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
});


App.WallPostFormTipView = Em.View.extend({
    tagName: 'article',
    classNames: ['sidebar', 'tip', 'not-implemented'],
    templateName: 'wallpost_form_tip',
    templateFile: 'wallpost'
});


App.WallPostView = Em.View.extend({
    tagName: 'article',
    classNames: ['wallpost'],
    templateName: 'wallpost',
    templateFile: 'wallpost',
    isAuthor: function(){
        var username = this.get('user').get('username');
        var authorname = this.get('content').get('author').get('username');
        if (username) {
            return (username == authorname);
        }
        return false;
    }.property('user', 'content'), 
    deleteWallPost: function(e) {
        if (confirm("Delete this wallpost?")) {
            e.preventDefault();
            var post = this.get('content');
            // Clear author here
            // TODO: Have a proper solution for belongsTo fields in adapter
            post.reopen({
                author: null
            });
            post.deleteRecord();
            App.store.commit();
            var self = this;
            this.$().slideUp(1000, function(){self.remove();});
        }
    }
});


App.ProjectWallPostListView = Em.CollectionView.extend({
    tagName: 'section',
    classNames: ['wrapper'],
    contentBinding: 'App.projectWallPostListController',
    itemViewClass: 'App.WallPostView'
});
