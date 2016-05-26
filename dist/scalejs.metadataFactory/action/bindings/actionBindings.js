'use strict';

/*global define */
/*jslint sloppy: true*/
define({
    'action-button': function actionButton() {
        var classes = this.buttonClasses || '';

        if (this.icon) {
            classes += ' fa fa-' + this.icon;
        }

        return {
            click: function click() {
                this.action();
            },
            disable: this.disabled,
            css: classes
        };
    }
});