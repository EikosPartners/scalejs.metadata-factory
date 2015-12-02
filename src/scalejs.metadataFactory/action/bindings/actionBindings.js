/*global define */
/*jslint sloppy: true*/
define({
    'action-button': function () {
        var classes = this.buttonClasses || '';
        
        if (this.icon) {
            classes += ' fa fa-' + this.icon;
        }
        
        return {
            click: function() {
                this.action();
            },
            css: classes
        }
    }
});
