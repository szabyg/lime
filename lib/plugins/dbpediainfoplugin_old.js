// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DBPediaInfoPlugin = (function(_super) {

    __extends(DBPediaInfoPlugin, _super);

    function DBPediaInfoPlugin() {
      return DBPediaInfoPlugin.__super__.constructor.apply(this, arguments);
    }

    DBPediaInfoPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref, _ref1, _results;
      this.name = 'DBPediaInfoPlugin';
      console.info("Initialize " + this.name);
      _ref = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        annotation = _ref[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0 && ((_ref1 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref1 === 'http://connectme.at/ontology#explicitlyMentions' || _ref1 === 'http://connectme.at/ontology#implicitlyShows' || _ref1 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DBPediaInfoPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/info.png",
            title: "" + (annotation.getLabel()) + " Info",
            type: "DbpediaInfoWidget",
            sortBy: function() {
              return 10000 * annotation.start + annotation.end;
            }
          });
          widget.annotation = annotation;
          jQuery(widget).bind('activate', function(e) {
            return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
          });
          annotation.widgets[_this.name] = widget;
          jQuery(annotation).bind("becomeActive", function(e) {
            return annotation.widgets[_this.name].setActive();
          });
          jQuery(annotation).bind("becomeInactive", function(e) {
            return annotation.widgets[_this.name].setInactive();
          });
          _this.getLSIImages(annotation);
          return jQuery(widget).bind("leftarrow", function(e) {
            return console.info('left arrow pressed', e);
          });
        }
      });
    };

    DBPediaInfoPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    DBPediaInfoPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, i, label, lime, lsiImageList, maintext, modalContent, n, page, result, secondarytext, startTime, textsum, tmptext, y,
        _this = this;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
          -- added 29.apr.2013 --
           LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
           example:
           LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
          a LSIImages can have the following structure:
          LSIImages = [
                        {
                        image:"imageURI",
                        hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                        },
      
                        {
                        image:"imageURI",
                        hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                        },
                        ...
                      ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      maintext = comment;
      secondarytext = "";
      if (maintext.length >= 240) {
        n = maintext.length;
        if (maintext.length >= 240) {
          tmptext = maintext.split(" ");
          n = tmptext.length;
          textsum = "";
          i = 0;
          while (textsum.length < 200) {
            textsum += tmptext[i] + " ";
            i++;
          }
          maintext = textsum;
          y = i;
          while (y < n) {
            secondarytext += tmptext[y] + " ";
            y++;
          }
        }
      }
      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = (typeof annotation.getLsiImagesResources === "function" ? annotation.getLsiImagesResources() : void 0) || [];
      console.log("Asociated images ", label, lsiImageList);
      /*
            -- added 29.apr.2013 --
            Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      */

      if (secondarytext.length > 2) {
        if (lsiImageList.length > 0) {
          result = "         <div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n         <div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;\">\n         <span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + comment + "</span>\n         <div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n         </div>\n\n         <div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n         <div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n         <div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n         </div>\n         </div>\n         <div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n         <div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n         </div>\n         <span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n         </div>\n\n         <div id=\"infoSecondText\" style=\" display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;\">\n" + secondarytext + "\n         </div>\n\n         <div id=\"infoSecondPic\" style=\"background-repeat: no-repeat; background-image: url('" + lsiImageList[0].image + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px;\"></div>\n\n\n         </div>";
        } else {
          result = "         <div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n         <div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;\">\n         <span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + comment + "</span>\n         <div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n         </div>\n\n         <div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n         <div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n         <div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n         </div>\n         </div>\n         <div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n         <div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n         </div>\n         <span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n         </div>\n\n         <div id=\"infoSecondText\" style=\"display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;\">\n" + secondarytext + "\n         </div>\n\n         <div id=\"infoSecondPic\" style=\" background-repeat: no-repeat; background-image: url('" + depiction + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; opacity: 0;\"></div>\n\n\n         </div>";
        }
      } else {
        if (lsiImageList.length > 0) {
          result = "<div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n<div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;\">\n<span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + maintext + "</span>\n<div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n</div>\n\n<div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n<div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n<div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n</div>\n</div>\n<div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n<div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n</div>\n<span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n</div>\n\n<div id=\"infoSecondText\" style=\"font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;\">\n\n</div>\n\n<div id=\"infoSecondPic\" style=\"background-repeat: no-repeat; background-image: url('" + lsiImageList[0].image + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: block;\"></div>\n\n\n</div>";
        } else {
          result = "<div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n<div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;\">\n<span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + maintext + "</span>\n<div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n</div>\n\n<div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n<div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n<div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n</div>\n</div>\n<div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n<div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n</div>\n<span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n</div>\n\n<div id=\"infoSecondText\" style=\"font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;\">\n\n</div>\n\n<div id=\"infoSecondPic\" style=\"background-repeat: no-repeat; background-image: url('" + depiction + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: none;\"></div>\n\n\n</div>";
        }
      }
      modalContent.append(result);
      $(".close").click(function(e) {
        var endTime, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        return console.log(": " + eventLabel + " was viewed " + timeSpent + " msec.");
      });
      return $('#mask').click(function(e) {
        var endTime, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        return console.log(": " + eventLabel + " was viewed " + timeSpent + " msec.");
      });
    };

    return DBPediaInfoPlugin;

  })(window.LimePlugin);

}).call(this);
