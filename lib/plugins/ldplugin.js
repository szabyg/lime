(function() {
  var RDF, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.LDPlugin = (function(_super) {
    __extends(LDPlugin, _super);

    function LDPlugin() {
      this.recursiveFetch = __bind(this.recursiveFetch, this);
      _ref = LDPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    LDPlugin.prototype.init = function() {
      var annotation, pausedBefore, waitForAnnotationFetch, _i, _len, _ref1, _results,
        _this = this;
      this.vie = this.lime.options.vie || this.options.vie;
      this.promises = {};
      if (!this.vie) {
        if (this.lime.options.local) {
          jQuery.noop();
        }
        this.vie = new VIE();
        this.vie.use(new this.vie.StanbolService({
          url: this.options.stanbolUrl
        }));
      }
      pausedBefore = this.lime.player.paused();
      _.defer(function() {
        _this.lime.player.pause();
        return console.info("Loading entities first... Player paused...");
      });
      waitForAnnotationFetch = this.lime.annotations.length;
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        annotation.lime = this.lime;
        annotation.vie = this.vie;
        _results.push(this.loadAnnotation(annotation, function() {
          waitForAnnotationFetch--;
          console.info("still waiting for so many annotations...", waitForAnnotationFetch);
          if (waitForAnnotationFetch === 0) {
            console.info("Loading entities finished.");
            if (!pausedBefore) {
              console.info("Playing again.");
              _this.lime.player.play();
            }
          }
          if (waitForAnnotationFetch < 0) {
            console.error("This should not ever happen!");
            debugger;
          }
        }));
      }
      return _results;
    };

    LDPlugin.prototype.defaults = {
      stanbolUrl: "http://dev.iks-project.eu/stanbolfull",
      followRedirects: [
        'dbpedia:wikiPageRedirects', 'rdfs:seeAlso', 'owl:sameAs', function(ent) {
          var engName;
          engName = VIE.Util.getPreferredLangForPreferredProperty(ent, ['rdfs:label', 'geonames:alternateName'], ["en"]);
          if (engName) {
            return "http://dbpedia.org/resource/" + (engName.replace(/\s/g, '_'));
          }
        }
      ]
    };

    LDPlugin.prototype.loadAnnotation = function(annotation, readyCb) {
      var debug, entityUri;
      entityUri = annotation.resource.value;
      if (annotation.isBookmark()) {
        annotation.getLabel = annotation.getName = function() {
          if (annotation.hash.prefLabel) {
            return annotation.hash.prefLabel.value;
          }
        };
        return readyCb();
      } else {
        if (this.promises[entityUri]) {
          annotation.entityPromise = this.promises[entityUri];
          annotation.entityPromise.annotations.push(annotation);
          readyCb();
          return;
        }
        annotation.entityPromise = this.promises[entityUri] = jQuery.Deferred();
        annotation.entityPromise.annotations = [annotation];
        debug = '';
        if (entityUri === debug) {
          this.lime.player.pause();
          debugger;
        }
        return this.recursiveFetch(entityUri, this.options.followRedirects, 2, function(res) {
          var _i, _len, _ref1;
          res = _(res).uniq(function(entity) {
            return entity.getSubject();
          });
          console.info("LDPlugin loaded", res);
          if (entityUri === debug) {
            this.lime.player.pause();
            debugger;
          }
          _ref1 = annotation.entityPromise.annotations;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            annotation = _ref1[_i];
            annotation.entities = res || [];
            annotation._detectPropertyLanguageOnEntity = function(properties, languages, defaultLabel) {
              var entity, value, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                value = VIE.Util.getPreferredLangForPreferredProperty(entity, properties, languages);
                if (value !== "n/a") {
                  return value;
                }
              }
              return defaultLabel;
            };
            annotation._detectProperty = function(property) {
              var entity, value, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                value = entity.get(property);
                if (value) {
                  return value;
                }
                this.entities[0].fromReference(entity.getSubject());
              }
            };
            annotation.getLabel = annotation.getName = function() {
              if (annotation.hash.prefLabel) {
                return annotation.hash.prefLabel.value;
              } else {
                return this._detectPropertyLanguageOnEntity(['rdfs:label', 'geonames:alternateName'], [this.lime.options.preferredLanguage, 'en'], "No label found.");
              }
            };
            annotation.getDescription = function() {
              return this._detectPropertyLanguageOnEntity(['dbpedia:abstract', 'rdfs:comment'], [this.lime.options.preferredLanguage, 'en'], "No description found.");
            };
            annotation.getDepiction = function(options) {
              var depiction, entity, result, singleDepiction, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                result = "";
                depiction = entity.get('foaf:depiction');
                if (depiction) {
                  if (_.isArray(depiction)) {
                    singleDepiction = _.detect(depiction, function(d) {
                      res = true;
                      if (options != null ? options["with"] : void 0) {
                        res = res && d.indexOf(options != null ? options["with"] : void 0) !== -1;
                      }
                      if (options != null ? options.without : void 0) {
                        res = res && d.indexOf(options != null ? options.without : void 0) === -1;
                      }
                      return res;
                    });
                    if (!singleDepiction) {
                      singleDepiction = depiction[0];
                    }
                  } else {
                    singleDepiction = depiction;
                  }
                  result = entity.fromReference(singleDepiction);
                }
                if (result) {
                  return result;
                }
              }
              return null;
            };
            annotation.getPage = function() {
              var entity, homepage, label, value, _j, _len1, _ref2;
              homepage = this._detectProperty(this.entities, 'foaf:homepage');
              if (!homepage) {
                _ref2 = this.entities;
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  entity = _ref2[_j];
                  if (entity.getSubject().indexOf('dbpedia') !== -1) {
                    label = VIE.Util.getPreferredLangForPreferredProperty(entity, ['rdfs:label'], [this.lime.options.preferredLanguage]);
                    return "http://" + this.lime.options.preferredLanguage + ".wikipedia.org/wiki/" + label;
                  } else {
                    value = entity.get('foaf:homepage');
                    if (value) {
                      return value;
                    }
                  }
                }
                if (this.entities.length) {
                  return this.entities[0].fromReference(entity.getSubject());
                } else {
                  return this.resource.value;
                }
              }
              return homepage;
            };
            annotation.getType = function() {
              var entity, result, typeSet, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                typeSet = entity.get('@type');
                if (_.isArray(typeSet)) {
                  result = typeSet;
                } else {
                  result = [typeSet];
                }
              }
              return result;
            };
            annotation.getStarring = function() {
              var entity, starringList, value, _j, _len1, _ref2;
              starringList = this._detectProperty(this.entities, 'dbpedia-owl:knownFor');
              if (!starringList) {
                _ref2 = this.entities;
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  entity = _ref2[_j];
                  value = entity.get('dbpedia-owl:knownFor');
                  if (_.isArray(value)) {
                    starringList = value;
                  } else {
                    starringList = [value];
                  }
                }
              }
              console.log("===== LDPlugin - getStarring result: ", starringList);
              return starringList;
            };
            annotation.getLatitude = function() {
              var entity, value, _j, _len1, _ref2;
              if (annotation.hash.latitude) {
                console.info('annotation.hash.latitude:', annotation.hash, annotation.hash.latitude);
                return annotation.hash.latitude.value;
              } else {
                value = 0.0;
                _ref2 = this.entities;
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  entity = _ref2[_j];
                  if (entity.getSubject().indexOf('geonames') !== -1) {
                    value = entity.attributes['<http://www.w3.org/2003/01/geo/wgs84_pos#lat>'];
                  }
                }
                console.log("Latitude = ", value);
                return value;
              }
            };
            annotation.getLongitude = function() {
              var entity, value, _j, _len1, _ref2;
              if (annotation.hash.longitude) {
                return annotation.hash.longitude.value;
              } else {
                value = 0.0;
                _ref2 = this.entities;
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  entity = _ref2[_j];
                  if (entity.getSubject().indexOf('geonames') !== -1) {
                    value = entity.attributes['<http://www.w3.org/2003/01/geo/wgs84_pos#long>'];
                  }
                }
                console.log("Latitude = ", value);
                return value;
              }
            };
          }
          annotation.entityPromise.resolve(annotation.entities);
          return readyCb();
        });
      }
    };

    LDPlugin.prototype.recursiveFetch = function(entityUri, props, depth, cb) {
      var error, handleMerge, results, success, waitfor,
        _this = this;
      results = [];
      waitfor = 0;
      handleMerge = function() {
        return asdf;
      };
      error = function(err) {
        waitfor--;
        console.error("Couldn't load entity " + entityUri, err);
        if (!(waitfor > 0)) {
          return cb([]);
        }
      };
      success = function(res) {
        var entity, prop, redir, redirUrl, redirects, _i, _j, _len, _len1, _results;
        entity = _.detect(res, function(ent) {
          return ent.fromReference(ent.getSubject()) === ent.fromReference(entityUri);
        });
        if (entity) {
          results.push(entity);
        }
        if (depth === 0) {
          return cb(_.flatten(results));
        } else {
          redirects = [];
          if (entity) {
            for (_i = 0, _len = props.length; _i < _len; _i++) {
              prop = props[_i];
              if (_.isString(prop)) {
                redir = entity.get(prop);
                if (!(redir != null ? redir.isEntity : void 0)) {
                  redirects.push(redir);
                }
              }
              if (_.isFunction(prop)) {
                redirects.push(prop(entity));
              }
            }
          }
          redirects = _.flatten(redirects);
          redirects = _.uniq(redirects);
          redirects = _.compact(redirects);
          waitfor = redirects.length;
          if (waitfor) {
            _results = [];
            for (_j = 0, _len1 = redirects.length; _j < _len1; _j++) {
              redirUrl = redirects[_j];
              _results.push(_this.recursiveFetch(redirUrl, props, depth - 1, function(r) {
                results.push(r);
                waitfor--;
                if (waitfor <= 0) {
                  return cb(_(results).flatten());
                }
              }));
            }
            return _results;
          } else {
            return cb(_(results).flatten());
          }
        }
      };
      return this.vie.load({
        entity: entityUri
      }).using('stanbol').execute().fail(error).success(success);
    };

    return LDPlugin;

  })(window.LimePlugin);

  RDF = (function() {
    function RDF(hash) {}

    return RDF;

  })();

}).call(this);
