define([
    'hgn!streamhub-sdk/content/templates/Content',
    'streamhub-sdk/util'
], function (ContentTemplate, Util) {
    
    // Construct a ContentView
    var ContentView = function ContentView (opts) {
        opts = opts || {};
        this.content = opts.content;
        
        if (this.content) {
            var self = this;
            this.content.on("addAttachment", function(content) {
                self.render();
                var newImg = $(self.el).find('img').last();
                newImg.hide();
                newImg.on('load', function() {
                    newImg.fadeIn();
                    $(self.el).trigger('imageLoaded');
                });
                newImg.on('error', function() {
                    self.content.attachments.pop();
                    newImg.remove();
                    self.render();
                });
            });
        }
        
        this.setElement(opts.el || document.createElement(this.elTag));
    };
    
    ContentView.prototype.elTag = 'article';
    ContentView.prototype.elClass = 'content';
    ContentView.prototype.template = ContentTemplate;
    
     /**
     * Set the .el DOMElement that the ContentView should render to
     * @param el {DOMElement} The new element the ContentView should render to
     */
    ContentView.prototype.setElement = function (el) {
        this.el = el;
        this.$el = $(el);
        this.$el.addClass(this.elClass);
        if (this.content && this.content.id) {
            this.$el.attr('data-content-id', this.content.id);
        }
    };
    
    // Render the content inside of the ContentView's element
    ContentView.prototype.render = function () {
        var context = this.getTemplateContext();
        context.formattedCreatedAt = Util.formatDate(this.content.createdAt);
        this.el.innerHTML = this.template(context);
    };
    
    ContentView.prototype.getTemplateContext = function () {
        return this.content;
    };
    
    return ContentView;
});