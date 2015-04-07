'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var link;
    var hover_trigger;

    var activate_msg = { msg: 'activate', url: 'URL' };

    beforeEach(function(done) {
        require(['hover-trigger'], function(_hover_trigger) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            hover_trigger = _hover_trigger;
            sandbox.stub(hover_trigger, 'isActive');
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="body"></div>');
        link = $('<a id="link" href="URL"></a>').appendTo(body);
        hover_trigger.on(body, '#link', function(_link) {
            return (link[0] === _link[0]) ? 'URL' : 'nope';
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('longpress', function() {
        it('should send activate on mousedown > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).to.have.been.calledWith(activate_msg);
        });

        it('should not send activate on mousedown[which!=1] > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 2 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.not.have.been.called;
        });

        it('should not send activate on mousedown > click > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            link.trigger($.Event('click', { which: 1 }));
            hover_trigger.isActive.returns(false);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        it('should not send activate on mousedown > mouseleave > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            link.mouseleave();
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });
    });

    describe('prevent other handlers', function() {
        it('should have pointer-events:none on mousedown[which==1] > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(link).to.have.css('pointer-events', 'none');
        });

        it('should have pointer-events:none on mousedown[which==1] > 333ms > click > 100ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);
            link.trigger($.Event('click', { which: 1 }));
            hover_trigger.isActive.returns(false);
            sandbox.clock.tick(100);

            expect(link).to.have.css('pointer-events', '');
        });
    });

    describe('firsthover', function() {
        it('should send notify:firsthover on mouseenter', function() {
            link.mouseenter();

            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'notify', type: 'firsthover' });
        });

        it('should not send notify:firsthover on mouseenter * 2', function() {
            link.mouseenter();
            var callCount = chrome.runtime.sendMessage.withArgs({ msg: 'notify', type: 'firsthover' }).callCount;
            link.mouseenter();

            expect(chrome.runtime.sendMessage.withArgs({ msg: 'notify', type: 'firsthover' }).callCount).to.equal(callCount);
        });

        it('should not send notify:firsthover on mouseenter if sync intro === true', function() {
            chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
            link.mouseenter();

            expect(chrome.runtime.sendMessage).not.to.have.been.calledWith({ msg: 'notify', type: 'firsthover' });
        });
    });
});
