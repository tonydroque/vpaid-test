(function (global) {
  'use strict';
  function TestVpaidAd() {
    this.events = {};
    this.slot = null;
    this.element = null;
    this.duration = 10;
    this.remaining = 10;
    this.volume = 1;
    this.started = false;
    this.timer = null;
    this.width = 640;
    this.height = 360;
  }
  TestVpaidAd.prototype.handshakeVersion = function () { return '2.0'; };
  TestVpaidAd.prototype.subscribe = function (callback, eventName, context) {
    if (typeof callback !== 'function') return;
    (this.events[eventName] = this.events[eventName] || []).push({ fn: callback, ctx: context });
  };
  TestVpaidAd.prototype.unsubscribe = function (callback, eventName) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(function (x) { return x.fn !== callback; });
  };
  TestVpaidAd.prototype.emit = function (eventName) {
    var args = Array.prototype.slice.call(arguments, 1);
    (this.events[eventName] || []).forEach(function (listener) {
      try { listener.fn.apply(listener.ctx || null, args); } catch (err) { console.error('[VPAID test] listener error', err); }
    });
    console.log('[VPAID test]', eventName);
  };
  TestVpaidAd.prototype.initAd = function (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.width = width || 640;
    this.height = height || 360;
    this.slot = environmentVars && environmentVars.slot;
    if (!this.slot) { this.emit('AdError', 'Missing environmentVars.slot'); return; }
    var box = document.createElement('div');
    box.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#16334c;color:white;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;font:600 22px Arial,sans-serif;z-index:2147483000;';
    box.innerHTML = '<div>VPAID 2.0 TEST CREATIVE</div><div style="font-size:15px;margin-top:12px">Waiting for startAd()</div>';
    this.slot.appendChild(box);
    this.element = box;
    this.emit('AdLoaded');
  };
  TestVpaidAd.prototype.startAd = function () {
    var self = this;
    if (this.started) return;
    this.started = true;
    this.emit('AdImpression');
    this.emit('AdStarted');
    this.emit('AdVideoStart');
    this.updateDisplay();
    this.timer = setInterval(function () {
      self.remaining = Math.max(0, self.remaining - 1);
      self.updateDisplay();
      if (self.remaining === 7) self.emit('AdVideoFirstQuartile');
      if (self.remaining === 5) self.emit('AdVideoMidpoint');
      if (self.remaining === 2) self.emit('AdVideoThirdQuartile');
      if (self.remaining === 0) {
        self.emit('AdVideoComplete');
        self.stopAd();
      }
    }, 1000);
  };
  TestVpaidAd.prototype.updateDisplay = function () {
    if (this.element) this.element.innerHTML = '<div>VPAID 2.0 TEST CREATIVE</div><div style="font-size:17px;margin-top:12px">Running: ' + this.remaining + 's remaining</div>';
  };
  TestVpaidAd.prototype.stopAd = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
    this.element = null;
    this.emit('AdStopped');
  };
  TestVpaidAd.prototype.resizeAd = function (width, height) { this.width = width; this.height = height; this.emit('AdSizeChange'); };
  TestVpaidAd.prototype.pauseAd = function () { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.emit('AdPaused'); };
  TestVpaidAd.prototype.resumeAd = function () { this.emit('AdPlaying'); };
  TestVpaidAd.prototype.expandAd = function () {};
  TestVpaidAd.prototype.collapseAd = function () {};
  TestVpaidAd.prototype.skipAd = function () { this.stopAd(); this.emit('AdSkipped'); };
  TestVpaidAd.prototype.getAdLinear = function () { return true; };
  TestVpaidAd.prototype.getAdWidth = function () { return this.width; };
  TestVpaidAd.prototype.getAdHeight = function () { return this.height; };
  TestVpaidAd.prototype.getAdExpanded = function () { return false; };
  TestVpaidAd.prototype.getAdSkippableState = function () { return false; };
  TestVpaidAd.prototype.getAdRemainingTime = function () { return this.remaining; };
  TestVpaidAd.prototype.getAdDuration = function () { return this.duration; };
  TestVpaidAd.prototype.getAdVolume = function () { return this.volume; };
  TestVpaidAd.prototype.setAdVolume = function (volume) { this.volume = volume; this.emit('AdVolumeChange'); };
  TestVpaidAd.prototype.getAdCompanions = function () { return ''; };
  TestVpaidAd.prototype.getAdIcons = function () { return false; };
  global.getVPAIDAd = function () { return new TestVpaidAd(); };
})(window);
