/** 
 * A module to Stream a Livefyre Collection in reverse chronological order
 * @module streamhub-sdk/streams/livefyre-reverse-stream
 */
define([
    'jquery',
    'streamhub-sdk/stream',
    'streamhub-sdk/streams/livefyre-stream',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'streamhub-sdk/content/types/livefyre-content',
    'streamhub-sdk/content/types/livefyre-twitter-content',
    'streamhub-sdk/content/types/livefyre-facebook-content',
    'streamhub-sdk/content/types/oembed',
    'streamhub-sdk/storage'
], function(
    $, 
    Stream, 
    LivefyreStream,
    LivefyreBootstrapClient, 
    LivefyreContent, 
    LivefyreTwitterContent, 
    LivefyreFacebookContent, 
    Oembed, 
    Storage
) {

    /**
     * Defines a livefyre stream that is readable in reverse time order from a livefyre
     * conversation.
     * @param opts {Object} A set of options to config the stream client with
     * @constructor
     * @alias module:streamhub-sdk/streams/livefyre-reverse-stream
     */
    var LivefyreReverseStream = function(opts) {
        Stream.call(this);
        this.opts = opts || {};
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleId = opts.articleId;
        this.environment = opts.environment;
        this.page = opts.page;
    };
    $.extend(LivefyreReverseStream.prototype, Stream.prototype);

    /**
     * Reads data from a Livefyre bootstrap page endpoint.
     * @private
     */
    LivefyreReverseStream.prototype._read = function() {
        var self = this;
        var opts = {
            network: this.network,
            siteId: this.siteId,
            articleId: this.articleId,
            page: this.page
        };
        if (this.environment) {
            opts.environment = this.environment;
        }

        LivefyreBootstrapClient.getContent(opts, function(err, data) {
            if (err) {
                self.emit('error', err);
                self._endRead();
                return;
            }
            var authors = data.authors;
            for (var i in data.content) {
                var state = data.content[i];
                state.author = authors[state.content.authorId];
                
                var content = LivefyreStream.createContent(state);

                if (content && content.id) {
                    Storage.set(content.id, content);
                }
                self._push(content);

                // todo: make this recursive for nested replies
                for (var j in state.childContent) {
                    var childContent = LivefyreStream.createContent(state.childContent[j]);
                    if (childContent instanceof Oembed) {
                        content.addAttachment(childContent);
                    } else {
                        content.addReply(childContent);
                    }
                    if (childContent && childContent.id) {
                        Storage.set(childContent.id, childContent);
                    }
                }
            }
            self._endRead();
        });
    };
    
    return LivefyreReverseStream;
});
