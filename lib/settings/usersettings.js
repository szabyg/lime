(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.UserSettingsPlugin = (function(_super) {
    __extends(UserSettingsPlugin, _super);

    function UserSettingsPlugin() {
      _ref = UserSettingsPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    UserSettingsPlugin.prototype.init = function() {
      var annotation, button, widget,
        _this = this;
      this.name = 'UserSettingsPlugin';
      annotation = void 0;
      console.info("Initialize UserSettingsPlugin");
      $("div .usersettings").click(function() {
        if (_this.lime.options.pauseOnWidgetopen) {
          _this.lime.player.pause();
        }
        return _this.renderUserSettingsInModalWindow();
      });
      button = $("<div class='vjs-control usersettings' title='User settings' alt='User settings'><div></div></div>");
      button.click(function(e) {
        if (_this.lime.options.pauseOnWidgetopen) {
          _this.lime.player.pause();
        }
        return _this.renderUserSettingsInModalWindow();
      });
      $(this.lime.player.buttonContainer).append(button);
      if (this.options.permanentWidget) {
        console.info('Permanent widgets are on.');
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/settingsWidget.png",
          title: "User settings",
          type: "UserSettingsWidget",
          sortBy: function() {
            return 100000000;
          }
        });
        jQuery(widget).bind('activate', function(e) {
          if (_this.lime.options.pauseOnWidgetopen) {
            _this.lime.player.pause();
          }
          return _this.renderUserSettingsInModalWindow();
        });
        return _.defer(function() {
          return widget.setActive();
        });
      }
    };

    UserSettingsPlugin.prototype.defaults = {
      unhidable: [],
      permanentWidget: false
    };

    UserSettingsPlugin.prototype.getAllWidgetTypes = function() {
      var res;
      res = _(this.lime.widgets).chain().map(function(widget) {
        return widget.options.type;
      }).uniq().sort().difference(this.defaults.unhidable, 'UserSettingsWidget').value();
      return res;
    };

    UserSettingsPlugin.prototype.getHiddenWidgetTypes = function() {
      return JSON.parse(localStorage.getItem('hiddenWidgetTypes')) || [];
    };

    UserSettingsPlugin.prototype.setHiddenWidgetTypes = function(types) {
      var toBeShown;
      localStorage.setItem('hiddenWidgetTypes', JSON.stringify(types));
      toBeShown = _(this.getAllWidgetTypes()).difference(types).concat(this.defaults.unhidable);
      return this.lime.updateDeactivatedWidgetStates(toBeShown);
    };

    UserSettingsPlugin.prototype.hideWidgetType = function(type) {
      var hiddenTypes;
      hiddenTypes = this.getHiddenWidgetTypes();
      hiddenTypes.push(type);
      hiddenTypes = _(hiddenTypes).uniq();
      return this.setHiddenWidgetTypes(hiddenTypes);
    };

    UserSettingsPlugin.prototype.unhideWidgetType = function(type) {
      var hiddenTypes, index;
      hiddenTypes = this.getHiddenWidgetTypes();
      index = hiddenTypes.indexOf(type);
      hiddenTypes.splice(index, 1);
      return this.setHiddenWidgetTypes(hiddenTypes);
    };

    UserSettingsPlugin.prototype.renderUserSettingsInModalWindow = function() {
      var checked, modalContent, settingsElement, settingssection, widgetType, _i, _len, _ref1,
        _this = this;
      modalContent = this.getModalContainer();
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      modalContent.css('overflow', 'auto');
      console.info("widget types:", this.getAllWidgetTypes());
      modalContent.append('<div class="settingscontent" style="color: white; width: 100%; height: auto; margin-top: 0; background: rgba(0,0,0,0.6);">');
      settingsElement = $('.settingscontent', modalContent);
      settingsElement.append("<span class=\"settingstitle\" style=\"font-size: 20px; margin-left: 10px;\">LIME player settings </span>");
      /*
      settingsElement.append """
        <p class="settingssection" style="font-size: 16px; "> Annotations </p>
        <form style="margin: 0 auto; text-align: left; font-size: 14px;width: 75%;">
          <div class="settingssection overlay-plugins" style="margin: 0 auto; ">
            <label><input type="checkbox" class="annotationspatialoverlay " checked="checked"> Show annotation overlays on the video</label><br/>
            <label><input type="checkbox" class="annotationtimelineoverlay setting" checked="checked"> Show annotation overlays on the timeline</label>
          </div>
        </form>
      """
      */

      $('.annotationspatialoverlay', settingssection).click(function(e) {});
      $('.annotationtimelineoverlay', settingssection).click(function(e) {});
      settingsElement.append("<p class=\"settingssection\" style=\"font-size: 16px; margin-left: 10px;\"> Widgets </p>\n<form style=\"margin: 0 auto; text-align: left; font-size: 14px; width: 75%;\" >\n  <div class=\"settingssection widget-types\" style=\"margin: 0 auto;\"></div>\n</form>\n<br/>");
      settingssection = $('div.settingssection.widget-types', settingsElement);
      _ref1 = this.getAllWidgetTypes();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        widgetType = _ref1[_i];
        checked = this.getHiddenWidgetTypes().indexOf(widgetType) === -1 ? 'checked' : '';
        settingssection.append("<div><label><input type='checkbox' name='" + widgetType + "' class='" + widgetType + " setting' " + checked + " > Show '" + widgetType + "' widgets</label></div>");
      }
      return $('.setting', settingssection).click(function(e) {
        var widgetName, widgetShown;
        widgetName = e.target.name;
        widgetShown = e.target.checked;
        if (widgetShown) {
          return _this.unhideWidgetType(widgetName);
        } else {
          return _this.hideWidgetType(widgetName);
        }
      });
    };

    return UserSettingsPlugin;

  })(window.LimePlugin);

}).call(this);
