App.LoginController.reopen(App.AuthJwtMixin, {
    loginTitle: gettext('Welcome!'),

    willClose: function () {
        this._super();

        // Also clear any FB login errors
        FBApp.set('connectError', null);
    }
});

App.SignupController.reopen({
    willOpen: function () {
        // Track google conversation in the controller as the signup
        // doesn't use a route so we can't use the built-in handler.
        var gc = {
            label: 'tlimCJr96wsQ7o7O1gM'
        };
        
        App.trackConversion(gc);
    }
});
