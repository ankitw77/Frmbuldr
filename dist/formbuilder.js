(function() {
  rivets.binders.input = {
    publishes: true,
    routine: rivets.binders.value.routine,
    bind: function(el) {
      return $(el).bind('input.rivets', this.publish);
    },
    unbind: function(el) {
      return $(el).unbind('input.rivets');
    }
  };

  rivets.configure({
    prefix: "rv",
    adapter: {
      subscribe: function(obj, keypath, callback) {
        callback.wrapped = function(m, v) {
          return callback(v);
        };
        return obj.on('change:' + keypath, callback.wrapped);
      },
      unsubscribe: function(obj, keypath, callback) {
        return obj.off('change:' + keypath, callback.wrapped);
      },
      read: function(obj, keypath) {
        if (keypath === "cid") {
          return obj.cid;
        }
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        if (obj.cid) {
          return obj.set(keypath, value);
        } else {
          return obj[keypath] = value;
        }
      }
    }
  });

}).call(this);

(function() {
  var BuilderView, EditFieldView, FormEditSettingsView, Formbuilder, FormbuilderCollection, FormbuilderModel, ViewFieldView, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FormbuilderModel = (function(_super) {
    __extends(FormbuilderModel, _super);

    function FormbuilderModel() {
      _ref = FormbuilderModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FormbuilderModel.prototype.sync = function() {};

    FormbuilderModel.prototype.indexInDOM = function() {
      var $wrapper,
        _this = this;
      $wrapper = $(".fb-field-wrapper").filter((function(_, el) {
        return $(el).data('cid') === _this.cid;
      }));
      return $(".fb-field-wrapper").index($wrapper);
    };

    FormbuilderModel.prototype.is_input = function() {
      return Formbuilder.inputFields[this.get(Formbuilder.options.mappings.FIELD_TYPE)] != null;
    };

    FormbuilderModel.prototype.is_form_setting_input = function() {
      return Formbuilder.inputFormSettingsFields[this.get(Formbuilder.options.mappings.FIELD_TYPE)] != null;
    };

    return FormbuilderModel;

  })(Backbone.DeepModel);

  FormbuilderCollection = (function(_super) {
    __extends(FormbuilderCollection, _super);

    function FormbuilderCollection() {
      _ref1 = FormbuilderCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    FormbuilderCollection.prototype.initialize = function() {
      return this.on('add', this.copyCidToModel);
    };

    FormbuilderCollection.prototype.model = FormbuilderModel;

    FormbuilderCollection.prototype.comparator = function(model) {
      return model.indexInDOM();
    };

    FormbuilderCollection.prototype.copyCidToModel = function(model) {
      return model.attributes.cid = model.cid;
    };

    return FormbuilderCollection;

  })(Backbone.Collection);

  ViewFieldView = (function(_super) {
    __extends(ViewFieldView, _super);

    function ViewFieldView() {
      _ref2 = ViewFieldView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    ViewFieldView.prototype.className = "fb-field-wrapper";

    ViewFieldView.prototype.events = {
      'click .subtemplate-wrapper': 'focusEditView',
      'click .js-duplicate': 'duplicate',
      'click .js-clear': 'clear'
    };

    ViewFieldView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      this.listenTo(this.model, "change", this.render);
      this.listenTo(this.model, "destroy", this.remove);
      return this.model.attributes.field_options.form_label_placement = Formbuilder.formLabelPlacement;
    };

    ViewFieldView.prototype.render = function() {
      console.log("change triggered");
      this.$el.addClass('response-field-' + this.model.get(Formbuilder.options.mappings.FIELD_TYPE)).data('cid', this.model.cid).html(Formbuilder.templates["view/base" + (this.model.is_form_setting_input() ? '_input_form_settings' : !this.model.is_input() ? '_non_input' : '')]({
        rf: this.model
      }));
      return this;
    };

    ViewFieldView.prototype.focusEditView = function() {
      return this.parentView.createAndShowEditView(this.model);
    };

    ViewFieldView.prototype.clear = function(e) {
      var cb, x,
        _this = this;
      e.preventDefault();
      e.stopPropagation();
      cb = function() {
        _this.parentView.handleFormUpdate();
        return _this.model.destroy();
      };
      x = Formbuilder.options.CLEAR_FIELD_CONFIRM;
      switch (typeof x) {
        case 'string':
          if (confirm(x)) {
            return cb();
          }
          break;
        case 'function':
          return x(cb);
        default:
          return cb();
      }
    };

    ViewFieldView.prototype.duplicate = function() {
      var attrs;
      attrs = _.clone(this.model.attributes);
      delete attrs['id'];
      attrs['label'] += ' Copy';
      return this.parentView.createField(attrs, {
        position: this.model.indexInDOM() + 1
      });
    };

    return ViewFieldView;

  })(Backbone.View);

  FormEditSettingsView = (function(_super) {
    __extends(FormEditSettingsView, _super);

    function FormEditSettingsView() {
      _ref3 = FormEditSettingsView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    FormEditSettingsView.prototype.className = "form-edit-settings-field";

    FormEditSettingsView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      return this.listenTo(this.model, "destroy", this.remove);
    };

    FormEditSettingsView.prototype.render = function() {
      this.$el.html(Formbuilder.templates["form_config/form_setting"]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    return FormEditSettingsView;

  })(Backbone.View);

  EditFieldView = (function(_super) {
    __extends(EditFieldView, _super);

    function EditFieldView() {
      _ref4 = EditFieldView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    EditFieldView.prototype.className = "edit-response-field";

    EditFieldView.prototype.events = {
      'click .js-add-option': 'addOption',
      'click .js-add-statement': 'addStatement',
      'click .js-remove-option': 'removeOption',
      'click .js-remove-statement': 'removeStatement',
      'click .js-default-updated': 'defaultUpdated',
      'input .option-label-input': 'forceRender'
    };

    EditFieldView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      return this.listenTo(this.model, "destroy", this.remove);
    };

    EditFieldView.prototype.render = function() {
      this.$el.html(Formbuilder.templates["edit/base" + (!this.model.is_input() ? '_non_input' : '')]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    EditFieldView.prototype.remove = function() {
      this.parentView.editView = void 0;
      this.parentView.$el.find("[data-target=\"#addField\"]").click();
      return EditFieldView.__super__.remove.apply(this, arguments);
    };

    EditFieldView.prototype.addOption = function(e) {
      var $el, i, newOption, options;
      $el = $(e.currentTarget);
      i = this.$el.find('.option').index($el.closest('.option'));
      options = this.model.get(Formbuilder.options.mappings.OPTIONS) || [];
      newOption = {
        label: "",
        checked: false
      };
      if (i > -1) {
        options.splice(i + 1, 0, newOption);
      } else {
        options.push(newOption);
      }
      this.model.set(Formbuilder.options.mappings.OPTIONS, options);
      this.model.trigger("change:" + Formbuilder.options.mappings.OPTIONS);
      return this.forceRender();
    };

    EditFieldView.prototype.removeOption = function(e) {
      var $el, index, options;
      $el = $(e.currentTarget);
      index = this.$el.find(".js-remove-option").index($el);
      options = this.model.get(Formbuilder.options.mappings.OPTIONS);
      options.splice(index, 1);
      this.model.set(Formbuilder.options.mappings.OPTIONS, options);
      this.model.trigger("change:" + Formbuilder.options.mappings.OPTIONS);
      return this.forceRender();
    };

    EditFieldView.prototype.addStatement = function(e) {
      var $el, i, newOption, options;
      $el = $(e.currentTarget);
      i = this.$el.find('.statement').index($el.closest('.statement'));
      options = this.model.get(Formbuilder.options.mappings.STATEMENTS) || [];
      newOption = {
        label: ""
      };
      if (i > -1) {
        options.splice(i + 1, 0, newOption);
      } else {
        options.push(newOption);
      }
      this.parentView.not_include_remove = "false";
      this.model.set(Formbuilder.options.mappings.STATEMENTS, options);
      this.model.trigger("change:" + Formbuilder.options.mappings.STATEMENTS);
      return this.forceRender();
    };

    EditFieldView.prototype.removeStatement = function(e) {
      var $el, index, options;
      $el = $(e.currentTarget);
      index = this.$el.find(".js-remove-statement").index($el);
      options = this.model.get(Formbuilder.options.mappings.STATEMENTS);
      options.splice(index, 1);
      this.model.set(Formbuilder.options.mappings.STATEMENTS, options);
      this.model.trigger("change:" + Formbuilder.options.mappings.STATEMENTS);
      return this.forceRender();
    };

    EditFieldView.prototype.defaultUpdated = function(e) {
      var $el;
      $el = $(e.currentTarget);
      if (this.model.get(Formbuilder.options.mappings.FIELD_TYPE) !== 'checkboxes') {
        this.$el.find(".js-default-updated").not($el).attr('checked', false).trigger('change');
      }
      return this.forceRender();
    };

    EditFieldView.prototype.forceRender = function() {
      return this.model.trigger('change');
    };

    return EditFieldView;

  })(Backbone.View);

  BuilderView = (function(_super) {
    __extends(BuilderView, _super);

    function BuilderView() {
      _ref5 = BuilderView.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    BuilderView.prototype.SUBVIEWS = [];

    BuilderView.prototype.formSettingsCreated = "true";

    BuilderView.prototype.events = {
      'click .fb-tabs a': 'showTab',
      'click .fb-add-field-types a': 'addField',
      'mouseover .fb-add-field-types': 'lockLeftWrapper',
      'mouseout .fb-add-field-types': 'unlockLeftWrapper'
    };

    BuilderView.prototype.initialize = function(options) {
      var selector;
      selector = options.selector, this.formBuilder = options.formBuilder, this.bootstrapData = options.bootstrapData;
      if (selector != null) {
        this.setElement($(selector));
      }
      this.collection = new FormbuilderCollection;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.reset, this);
      this.collection.bind('change', this.handleFormUpdate, this);
      this.collection.bind('destroy add reset', this.hideShowNoResponseFields, this);
      this.collection.bind('destroy', this.ensureEditViewScrolled, this);
      this.render();
      this.collection.reset(this.bootstrapData);
      this.bindSaveEvent();
      return this.addFormSettings();
    };

    BuilderView.prototype.bindSaveEvent = function() {
      var _this = this;
      this.formSaved = true;
      if (!!Formbuilder.options.AUTOSAVE) {
        setInterval(function() {
          return _this.saveForm.call(_this);
        }, 5000);
      }
      return $(window).bind('beforeunload', function() {
        if (_this.formSaved) {
          return void 0;
        } else {
          return Formbuilder.options.dict.UNSAVED_CHANGES;
        }
      });
    };

    BuilderView.prototype.reset = function() {
      this.$responseFields.html('');
      return this.addAll();
    };

    BuilderView.prototype.render = function() {
      var subview, _i, _len, _ref6;
      this.$el.html(Formbuilder.templates['page']());
      this.$fbLeft = this.$el.find('.fb-left');
      this.$responseFields = this.$el.find('.fb-response-fields');
      this.bindWindowScrollEvent();
      this.hideShowNoResponseFields();
      _ref6 = this.SUBVIEWS;
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        subview = _ref6[_i];
        new subview({
          parentView: this
        }).render();
      }
      return this;
    };

    BuilderView.prototype.bindWindowScrollEvent = function() {
      var _this = this;
      return $(window).on('scroll', function() {
        var maxMargin, newMargin;
        if (_this.$fbLeft.data('locked') === true) {
          return;
        }
        newMargin = Math.max(0, $(window).scrollTop() - _this.$el.offset().top);
        maxMargin = _this.$responseFields.height();
        return _this.$fbLeft.css({
          'margin-top': Math.min(maxMargin, newMargin)
        });
      });
    };

    BuilderView.prototype.showTab = function(e) {
      var $el, first_model, target;
      $el = $(e.currentTarget);
      target = $el.data('target');
      $el.closest('li').addClass('active').siblings('li').removeClass('active');
      $(target).addClass('active').siblings('.fb-tab-pane').removeClass('active');
      if (target !== '#editField') {
        this.unlockLeftWrapper();
      }
      if (target === '#editField' && !this.editView && (first_model = this.collection.models[0])) {
        if (first_model.attributes.field_type !== 'form_header') {
          return this.createAndShowEditView(first_model);
        }
      }
    };

    BuilderView.prototype.addFormSettings = function() {
      debugger;
      var field_type, rf;
      field_type = "form_header";
      rf = this.collection.create(Formbuilder.helpers.defaultFieldAttrs(field_type));
      if (!_.isEmpty(rf.attributes.field_options.form_label_placement)) {
        Formbuilder.formLabelPlacement = rf.attributes.field_options.form_label_placement;
      } else {
        Formbuilder.formLabelPlacement = '';
      }
      return this.createAndShowFormEditView(rf);
    };

    BuilderView.prototype.addOne = function(responseField, _, options) {
      var $replacePosition, view;
      view = new ViewFieldView({
        model: responseField,
        parentView: this
      });
      if (options.$replaceEl != null) {
        return options.$replaceEl.replaceWith(view.render().el);
      } else if ((options.position == null) || options.position === -1) {
        return this.$responseFields.append(view.render().el);
      } else if (options.position === 0) {
        return this.$responseFields.prepend(view.render().el);
      } else if (($replacePosition = this.$responseFields.find(".fb-field-wrapper").eq(options.position))[0]) {
        return $replacePosition.before(view.render().el);
      } else {
        return this.$responseFields.append(view.render().el);
      }
    };

    BuilderView.prototype.setSortable = function() {
      var _this = this;
      if (this.$responseFields.hasClass('ui-sortable')) {
        this.$responseFields.sortable('destroy');
      }
      this.$responseFields.sortable({
        forcePlaceholderSize: true,
        placeholder: 'sortable-placeholder',
        items: "> *:not(.response-field-form_header)",
        stop: function(e, ui) {
          var rf;
          if (ui.item.data('field-type')) {
            rf = _this.collection.create(Formbuilder.helpers.defaultFieldAttrs(ui.item.data('field-type')), {
              $replaceEl: ui.item
            });
            _this.createAndShowEditView(rf);
          }
          _this.handleFormUpdate();
          return true;
        },
        update: function(e, ui) {
          if (!ui.item.data('field-type')) {
            return _this.ensureEditViewScrolled();
          }
        }
      });
      return this.setDraggable();
    };

    BuilderView.prototype.setDraggable = function() {
      var $addFieldButtons,
        _this = this;
      $addFieldButtons = this.$el.find("[data-field-type]");
      return $addFieldButtons.draggable({
        connectToSortable: this.$responseFields,
        helper: function() {
          var $helper;
          $helper = $("<div class='response-field-draggable-helper' />");
          $helper.css({
            width: _this.$responseFields.width(),
            height: '80px'
          });
          return $helper;
        }
      });
    };

    BuilderView.prototype.addAll = function() {
      this.collection.each(this.addOne, this);
      return this.setSortable();
    };

    BuilderView.prototype.hideShowNoResponseFields = function() {
      return this.$el.find(".fb-no-response-fields")[this.collection.length > 0 ? 'hide' : 'show']();
    };

    BuilderView.prototype.addField = function(e) {
      var field_type;
      field_type = $(e.currentTarget).data('field-type');
      return this.createField(Formbuilder.helpers.defaultFieldAttrs(field_type));
    };

    BuilderView.prototype.createField = function(attrs, options) {
      var rf;
      rf = this.collection.create(attrs, options);
      this.createAndShowEditView(rf);
      return this.handleFormUpdate();
    };

    BuilderView.prototype.createAndShowEditView = function(model) {
      var $newEditEl, $responseFieldEl;
      $responseFieldEl = this.$el.find(".fb-field-wrapper").filter(function() {
        return $(this).data('cid') === model.cid;
      });
      $responseFieldEl.addClass('editing').siblings('.fb-field-wrapper').removeClass('editing');
      if (this.editView) {
        if (this.editView.model.cid === model.cid) {
          this.$el.find(".fb-tabs a[data-target=\"#editField\"]").click();
          this.scrollLeftWrapper($responseFieldEl);
          return;
        }
        this.editView.remove();
      }
      this.editView = new EditFieldView({
        model: model,
        parentView: this
      });
      $newEditEl = this.editView.render().$el;
      this.$el.find(".fb-edit-field-wrapper").html($newEditEl);
      this.$el.find(".fb-tabs a[data-target=\"#editField\"]").click();
      this.scrollLeftWrapper($responseFieldEl);
      return this;
    };

    BuilderView.prototype.createAndShowFormEditView = function(model) {
      var $newFormEditEl;
      this.formEditView = new FormEditSettingsView({
        model: model,
        parentView: this
      });
      $newFormEditEl = this.formEditView.render().$el;
      this.$el.find(".fb-form-settings-wrapper").html($newFormEditEl);
      return this;
    };

    BuilderView.prototype.createAndShowFormView = function(model) {
      var $newFormEl;
      this.formView = new FormSettingsView({
        model: model,
        parentView: this
      });
      $newFormEl = this.formView.render().$el;
      this.$el.find(".fb-right").prepend($newFormEl);
      return this;
    };

    BuilderView.prototype.ensureEditViewScrolled = function() {
      if (!this.editView) {
        return;
      }
      return this.scrollLeftWrapper($(".fb-field-wrapper.editing"));
    };

    BuilderView.prototype.scrollLeftWrapper = function($responseFieldEl) {
      var _this = this;
      this.unlockLeftWrapper();
      if (!$responseFieldEl[0]) {
        return;
      }
      return $.scrollWindowTo((this.$el.offset().top + $responseFieldEl.offset().top) - this.$responseFields.offset().top, 200, function() {
        return _this.lockLeftWrapper();
      });
    };

    BuilderView.prototype.lockLeftWrapper = function() {
      return this.$fbLeft.data('locked', true);
    };

    BuilderView.prototype.unlockLeftWrapper = function() {
      return this.$fbLeft.data('locked', false);
    };

    BuilderView.prototype.handleFormUpdate = function(responseField, _, options) {
      var _i, _len, _ref6;
      if (responseField && responseField.attributes.field_type === 'form_header') {
        _ref6 = this.collection.models;
        for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
          this.coll = _ref6[_i];
          this.checkTemp(this.coll, responseField.attributes.field_options.form_label_placement);
        }
      }
      if (this.updatingBatch) {
        return;
      }
      return this.formSaved = false;
    };

    BuilderView.prototype.checkTemp = function(coll, labelAlignment) {
      this.coll = coll;
      if (this.coll.attributes.field_type !== 'form_header') {
        this.coll.attributes.field_options.form_label_placement = labelAlignment;
        Formbuilder.formLabelPlacement = labelAlignment;
        return this.coll.trigger('change');
      }
    };

    BuilderView.prototype.saveForm = function(e) {
      var payload;
      if (this.formSaved) {
        return;
      }
      this.formSaved = true;
      this.collection.sort();
      payload = JSON.stringify({
        fields: this.collection.toJSON()
      });
      if (Formbuilder.options.HTTP_ENDPOINT) {
        this.doAjaxSave(payload);
      }
      return this.formBuilder.trigger('save', payload);
    };

    BuilderView.prototype.doAjaxSave = function(payload) {
      var _this = this;
      return $.ajax({
        url: Formbuilder.options.HTTP_ENDPOINT,
        type: Formbuilder.options.HTTP_METHOD,
        data: payload,
        contentType: "application/json",
        success: function(data) {
          var datum, _i, _len, _ref6;
          _this.updatingBatch = true;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            datum = data[_i];
            if ((_ref6 = _this.collection.get(datum.cid)) != null) {
              _ref6.set({
                id: datum.id
              });
            }
            _this.collection.trigger('sync');
          }
          return _this.updatingBatch = void 0;
        }
      });
    };

    return BuilderView;

  })(Backbone.View);

  Formbuilder = (function() {
    Formbuilder.helpers = {
      defaultFieldAttrs: function(field_type) {
        var attrs, _base;
        attrs = {};
        attrs[Formbuilder.options.mappings.LABEL] = 'Untitled';
        attrs[Formbuilder.options.mappings.FIELD_TYPE] = field_type;
        attrs[Formbuilder.options.mappings.REQUIRED] = true;
        attrs['field_options'] = {};
        return (typeof (_base = Formbuilder.fields[field_type]).defaultAttributes === "function" ? _base.defaultAttributes(attrs) : void 0) || attrs;
      },
      simple_format: function(x) {
        return x != null ? x.replace(/\n/g, '<br />') : void 0;
      }
    };

    Formbuilder.options = {
      BUTTON_CLASS: 'fb-button',
      HTTP_ENDPOINT: '',
      HTTP_METHOD: 'POST',
      AUTOSAVE: true,
      CLEAR_FIELD_CONFIRM: false,
      mappings: {
        FORM_NAME: 'field_options.form_name',
        FORM_DESCRIPTION: 'field_options.form_description',
        FORM_LABEL_PLACEMENT: 'field_options.form_label_placement',
        FORM_CONFIRMATION_DESCRIPTION: 'field_options.form_confirmation_description',
        FORM_SEND_CONFIRMATION_EMAIL: 'field_options.form_send_confirmation_email',
        FORM_CONFIRMATION_OPTION: 'field_options.form_confirmation_option',
        SIZE: 'field_options.size',
        UNITS: 'field_options.units',
        CURRENCY: 'field_options.currency',
        LABEL: 'label',
        FIELDLAYOUT: 'field_options.field_layout',
        FIELD_TYPE: 'field_type',
        REQUIRED: 'required',
        NAME_FORMAT: 'field_options.name_format',
        ADMIN_ONLY: 'admin_only',
        OPTIONS: 'field_options.options',
        TIME_FORMAT: 'field_options.time_format',
        PHONE_FORMAT: 'field_options.phone_format',
        DATE_FORMAT: 'field_options.date_format',
        DESCRIPTION: 'field_options.description',
        INCLUDE_OTHER: 'field_options.include_other_option',
        INCLUDE_BLANK: 'field_options.include_blank_option',
        INTEGER_ONLY: 'field_options.integer_only',
        MIN: 'field_options.min',
        STATEMENTS: 'field_options.statements',
        PREDEFINED_VALUE: 'field_options.predefined_value',
        PREDEFINED_DATE_FIRST: 'field_options.predefined_date_first',
        PREDEFINED_DATE_SECOND: 'field_options.predefined_date_second',
        PREDEFINED_DATE_YEAR: 'field_options.predefined_date_year',
        MAX: 'field_options.max',
        MINLENGTH: 'field_options.minlength',
        MAXLENGTH: 'field_options.maxlength',
        LENGTH_UNITS: 'field_options.min_max_length_units',
        INCLUDE_NA: 'field_options.include_na'
      },
      dict: {
        ALL_CHANGES_SAVED: 'All changes saved',
        SAVE_FORM: 'Save form',
        UNSAVED_CHANGES: 'You have unsaved changes. If you leave this page, you will lose those changes!'
      }
    };

    Formbuilder.fields = {};

    Formbuilder.inputFields = {};

    Formbuilder.nonInputFields = {};

    Formbuilder.inputFormSettingsFields = {};

    Formbuilder.formLabelPlacement = {};

    Formbuilder.registerField = function(name, opts) {
      var x, _i, _len, _ref6;
      _ref6 = ['view', 'edit'];
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        x = _ref6[_i];
        opts[x] = _.template(opts[x]);
      }
      opts.field_type = name;
      Formbuilder.fields[name] = opts;
      if (opts.type === 'non_input') {
        return Formbuilder.nonInputFields[name] = opts;
      } else if (opts.type === 'input_form_settings') {
        return Formbuilder.inputFormSettingsFields[name] = opts;
      } else {
        return Formbuilder.inputFields[name] = opts;
      }
    };

    function Formbuilder(opts) {
      var args;
      if (opts == null) {
        opts = {};
      }
      _.extend(this, Backbone.Events);
      args = _.extend(opts, {
        formBuilder: this
      });
      this.mainView = new BuilderView(args);
    }

    return Formbuilder;

  })();

  window.Formbuilder = Formbuilder;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Formbuilder;
  } else {
    window.Formbuilder = Formbuilder;
  }

}).call(this);

(function() {
  Formbuilder.registerField('address', {
    order: 50,
    view: "<div class='address-container <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n  <div class='input-line'>\n    <span class='street'>\n      <input type='text' />\n      <label>Address</label>\n    </span>\n  </div>\n\n  <div class='input-line'>\n    <span class='city'>\n      <input type='text' />\n      <label>City</label>\n    </span>\n\n    <span class='state'>\n      <input type='text' />\n      <label>State / Province / Region</label>\n    </span>\n  </div>\n\n  <div class='input-line'>\n    <span class='zip'>\n      <input type='text' />\n      <label>Zipcode</label>\n    </span>\n\n    <span class='country'>\n      <select><option>United States</option></select>\n      <label>Country</label>\n    </span>\n  </div>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-home\"></span></span> Address"
  });

}).call(this);

(function() {
  Formbuilder.registerField('checkboxes', {
    order: 10,
    view: "<% field_layout_value = rf.get(Formbuilder.options.mappings.FIELDLAYOUT) %>\n<% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n  <div class = '<%= field_layout_value %> multichoice <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n    <label class='fb-option'>\n      <input type='checkbox' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n",
    edit: "<%= Formbuilder.templates['edit/field_layout']()%>\n<%= Formbuilder.templates['edit/options']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-square-o\"></span></span> Checkboxes",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('date', {
    order: 20,
    view: "<div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n  <% if(rf.get(Formbuilder.options.mappings.DATE_FORMAT) == 'MM/DD/YYYY'){ %>\n  <span class='month'>\n    <input type=\"text\" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_FIRST) %>' />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='day'>\n    <input type=\"text\" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_SECOND) %>' />\n    <label>DD</label>\n  </span>\n  <% } %>\n\n  <% if(rf.get(Formbuilder.options.mappings.DATE_FORMAT) == 'DD/MM/YYYY'){ %>\n  <span class='day'>\n    <input type=\"text\" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_FIRST) %>' />\n    <label>DD</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n   <span class='month'>\n    <input type=\"text\" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_SECOND) %>' />\n    <label>MM</label>\n  </span>\n  <% } %>\n\n  <span class='above-line'>/</span>\n\n  <span class='year'>\n    <input type=\"text\" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_YEAR) %>' />\n    <label>YYYY</label>\n  </span>\n</div>",
    edit: "<%= Formbuilder.templates['edit/date_format']()%>\n<%= Formbuilder.templates['edit/predefined_date']()%>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-calendar\"></span></span> Date",
    defaultAttributes: function(attrs) {
      attrs.field_options.date_format = "MM/DD/YYYY";
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('dropdown', {
    order: 24,
    view: "<select class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %> <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n  <% if (rf.get(Formbuilder.options.mappings.INCLUDE_BLANK)) { %>\n    <option value=''></option>\n  <% } %>\n\n  <% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n    <option <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'selected' %>>\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </option>\n  <% } %>\n</select>",
    edit: "<%= Formbuilder.templates['edit/predefined_value']() %>\n<%= Formbuilder.templates['edit/size']() %>\n<%= Formbuilder.templates['edit/options']({ includeBlank: true }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-caret-down\"></span></span> Dropdown",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = "small";
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      attrs.field_options.include_blank_option = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('email', {
    order: 40,
    view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %>'/>",
    edit: "<%= Formbuilder.templates['edit/predefined_value']() %>\n<%= Formbuilder.templates['edit/size']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-envelope-o\"></span></span> Email"
  });

}).call(this);

(function() {


}).call(this);

(function() {
  Formbuilder.registerField('form_header', {
    order: 5,
    type: 'input_form_settings',
    view: "  	<div class=\"form-header\">\n	<label class = \"form-name\">\n		<span>\n			<% if(typeof rf !== \"undefined\"){ %>\n			<%= rf.get(Formbuilder.options.mappings.FORM_NAME)%>\n			<% } %>\n		</span>\n	</label>\n	<br />\n	<label class = \"form-description\">\n		<span>\n			<% if(typeof rf !== \"undefined\"){ %>\n			<%= rf.get(Formbuilder.options.mappings.FORM_DESCRIPTION)%>\n			<% } %>\n		</span>\n	</label>\n\n</div>",
    edit: "   ",
    defaultAttributes: function(attrs) {
      attrs.field_options.form_name = "Untitled";
      attrs.field_options.form_description = "Description";
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('likert', {
    order: 51,
    view: "\n<table class=\"likert\">\n  <tr class=\"header\">\n  <td></td>\n  <% for (j in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n    <th>\n         <label class='fb-option'> <%= rf.get(Formbuilder.options.mappings.OPTIONS)[j].label %> </label>\n    </th>\n  <% } %>\n\n  <% if(rf.get(Formbuilder.options.mappings.INCLUDE_NA)) {%>\n  <th>\n     <label class='fb-option'> N/A </label>\n  </th>\n  <% } %>\n  <tr/ >\n\n  <% for (i in (rf.get(Formbuilder.options.mappings.STATEMENTS) || [])) { %>\n    <tr>\n      <td>\n        <label class='fb-option'> <%= rf.get(Formbuilder.options.mappings.STATEMENTS)[i].label %></label>\n      </td>\n\n      <% for (j in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n      <td>\n        <input type=\"radio\" <%= rf.get(Formbuilder.options.mappings.OPTIONS)[j].checked && 'checked' %> />\n      </td>\n      <% } %>\n\n      <% if(rf.get(Formbuilder.options.mappings.INCLUDE_NA)) {%>\n      <td>\n        <input type=\"radio\" />\n      </td>\n      <% } %>\n    </tr>\n\n  <% } %>\n\n</table>\n",
    edit: "<%= Formbuilder.templates['edit/likert']()%>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-table\"></span></span> Likert",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "Column 1",
          checked: false
        }, {
          label: "Column 2",
          checked: false
        }
      ];
      attrs.field_options.statements = [
        {
          label: "Statement 1",
          checked: false
        }, {
          label: "Statement 2",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('name', {
    order: 52,
    view: "<div class='input-line'>\n\n  <% if(rf.get(Formbuilder.options.mappings.NAME_FORMAT) == 'extended'){ %>\n  <span class='title'>\n    <input type='text' />\n    <label>Title</label>\n  </span>\n  &nbsp;&nbsp;&nbsp;\n  <% } %>\n\n  <span class='first'>\n    <input type='text' />\n    <label>First</label>\n  </span>\n  &nbsp;&nbsp;&nbsp;\n\n  <span class='last'>\n    <input type='text' />\n    <label>Last</label>\n  </span>\n  &nbsp;&nbsp;&nbsp;\n\n  <% if(rf.get(Formbuilder.options.mappings.NAME_FORMAT) == 'extended'){ %>\n  <span class='suffix'>\n    <input type='text' />\n    <label>Suffix</label>\n  </span>\n  &nbsp;&nbsp;&nbsp;\n   <% } %>\n</div>",
    edit: "<%= Formbuilder.templates['edit/name_format']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-newspaper-o\"></span></span> Name"
  });

}).call(this);

(function() {
  Formbuilder.registerField('number', {
    order: 30,
    view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE)%>'/>\n<% if (units = rf.get(Formbuilder.options.mappings.UNITS)) { %>\n  <%= units %>\n<% } %>",
    edit: "<%= Formbuilder.templates['edit/predefined_value']() %>\n<%= Formbuilder.templates['edit/size']() %>\n<%= Formbuilder.templates['edit/min_max']() %>\n<%= Formbuilder.templates['edit/units']() %>\n<%= Formbuilder.templates['edit/integer_only']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-number\">123</span></span> Number"
  });

}).call(this);

(function() {
  Formbuilder.registerField('page_break', {
    order: 54,
    type: 'non_input',
    view: "<div class='page-break'><span>----------------------------------- PAGE BREAK -----------------------------------</span></div>",
    edit: "   ",
    addButton: "<span class='symbol'><span class='fa fa-minus'></span></span> Page Break"
  });

}).call(this);

(function() {
  Formbuilder.registerField('paragraph', {
    order: 5,
    view: "<textarea class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>'><%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %></textarea>",
    edit: "<%= Formbuilder.templates['edit/predefined_value']() %>\n<%= Formbuilder.templates['edit/size']() %>\n<%= Formbuilder.templates['edit/min_max_length']() %>",
    addButton: "<span class=\"symbol\">&#182;</span> Paragraph",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('phone', {
    order: 55,
    view: "<div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n <% if(rf.get(Formbuilder.options.mappings.PHONE_FORMAT) === \"international\") {%>\n   <span class='international'>\n     <input type=\"text\" />\n   </span>\n <% } %>\n <% if(rf.get(Formbuilder.options.mappings.PHONE_FORMAT) === \"local\"){ %>    \n   <span class='first_part'>\n     <input type=\"text\" />\n     <label>###</label>\n   </span>\n\n   <span class='above-line'>-</span>\n\n   <span class='second_part'>\n     <input type=\"text\" />\n     <label>###</label>\n   </span>\n\n   <span class='above-line'>-</span>\n\n   <span class='third_part'>\n     <input type=\"text\" />\n     <label>#####</label>\n   </span>\n <% } %>\n   \n </div>",
    edit: "<%= Formbuilder.templates['edit/phone_format']()%>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-phone\"></span></span> Phone",
    defaultAttributes: function(attrs) {
      attrs.field_options.phone_format = "local";
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('price', {
    order: 45,
    view: "<div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n  <span class='above-line'>\n  <% currency = \"Dollar\" %>\n  <% if(newCurrency = rf.get(Formbuilder.options.mappings.CURRENCY)){currency = newCurrency} %>\n  <%= currency %>\n  </span>\n  <span class='dolars'>\n    <input type='text' />\n  </span>\n  <span class='above-line'>.</span>\n  <span class='cents'>\n    <input type='text' />\n  </span>\n</div>",
    edit: "<%= Formbuilder.templates['edit/currency']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-usd\"></span></span> Price"
  });

}).call(this);

(function() {
  Formbuilder.registerField('radio', {
    order: 15,
    view: "<% field_layout_value = rf.get(Formbuilder.options.mappings.FIELDLAYOUT) %>\n<% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n  <div class = '<%= field_layout_value %> multichoice <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n    <label class='fb-option'>\n      <input type='radio' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n",
    edit: "<%= Formbuilder.templates['edit/field_layout']()%>\n<%= Formbuilder.templates['edit/options']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-circle-o\"></span></span> Multiple Choice",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('section_break', {
    order: 1,
    type: 'non_input',
    view: "<label class='section-name'><%= rf.get(Formbuilder.options.mappings.LABEL) %></label>\n<p><%= rf.get(Formbuilder.options.mappings.DESCRIPTION) %></p>",
    edit: "<div class='fb-edit-section-header'>Label</div>\n<input type='text' data-rv-input='model.<%= Formbuilder.options.mappings.LABEL %>' />\n<textarea data-rv-input='model.<%= Formbuilder.options.mappings.DESCRIPTION %>'\n  placeholder='Add a longer description to this field'></textarea>",
    addButton: "<span class='symbol'><span class='fa fa-minus'></span></span> Section Break"
  });

}).call(this);

(function() {
  Formbuilder.registerField('text', {
    order: 0,
    view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' value = '<%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %>'/>",
    edit: "<%= Formbuilder.templates['edit/predefined_value']() %>\n<%= Formbuilder.templates['edit/size']() %>\n<%= Formbuilder.templates['edit/min_max_length']() %>",
    addButton: "<span class='symbol'><span class='fa fa-font'></span></span> Text",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('time', {
    order: 25,
    view: "<div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>\n  <span class='hours'>\n    <input type=\"text\" />\n    <label>HH</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='minutes'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='seconds'>\n    <input type=\"text\" />\n    <label>SS</label>\n  </span>\n\n  <% if(rf.get(Formbuilder.options.mappings.TIME_FORMAT) !== \"24\") {%>\n  <span class='am_pm'>\n    <select>\n      <option>AM</option>\n      <option>PM</option>\n    </select>\n  </span>\n  <% } %>\n</div>",
    edit: "<%= Formbuilder.templates['edit/time_format']()%>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-clock-o\"></span></span> Time"
  });

}).call(this);

(function() {
  Formbuilder.registerField('website', {
    order: 35,
    view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' placeholder='http://' value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %>' />",
    edit: "<%= Formbuilder.templates['edit/predefined_value']() %>\n<%= Formbuilder.templates['edit/size']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-link\"></span></span> Website"
  });

}).call(this);

this["Formbuilder"] = this["Formbuilder"] || {};
this["Formbuilder"]["templates"] = this["Formbuilder"]["templates"] || {};

this["Formbuilder"]["templates"]["edit/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.templates['edit/base_header']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.templates['edit/common']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/base_header"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-field-label\'>\n  <span data-rv-text="model.' +
((__t = ( Formbuilder.options.mappings.LABEL )) == null ? '' : __t) +
'"></span>\n  <code class=\'field-type\' data-rv-text=\'model.' +
((__t = ( Formbuilder.options.mappings.FIELD_TYPE )) == null ? '' : __t) +
'\'></code>\n  <span class=\'fa fa-arrow-right pull-right\'></span>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/base_non_input"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.templates['edit/base_header']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/checkboxes"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<label>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.REQUIRED )) == null ? '' : __t) +
'\' />\n  Required\n</label>\n<!-- label>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.ADMIN_ONLY )) == null ? '' : __t) +
'\' />\n  Admin only\n</label -->';

}
return __p
};

this["Formbuilder"]["templates"]["edit/common"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Label</div>\n\n<div class=\'fb-common-wrapper\'>\n  <div class=\'fb-label-description\'>\n    ' +
((__t = ( Formbuilder.templates['edit/label_description']() )) == null ? '' : __t) +
'\n  </div>\n  <div class=\'fb-common-checkboxes\'>\n    ' +
((__t = ( Formbuilder.templates['edit/checkboxes']() )) == null ? '' : __t) +
'\n  </div>\n  <div class=\'fb-clear\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/currency"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Currency</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.CURRENCY )) == null ? '' : __t) +
'">\n  <option value="Dollars">$ Dollars</option>\n  <option value="Baht">&#3647; Baht</option>  \n  <option value="Euros">&euro; Euros</option>\n  <option value="Francs">CHF Francs</option>\n  <option value="Pesos">$ Pesos</option>\n  <option value="Pounds Sterling">&pound; Pounds Sterling</option>\n  <option value="Yen">&yen; Yen</option>\n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/date_format"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Date Format</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.DATE_FORMAT )) == null ? '' : __t) +
'">\n  <option value="MM/DD/YYYY">MM / DD/ YYYY</option>\n  <option value="DD/MM/YYYY">DD / MM / YYYY</option>  \n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/field_layout"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Field Layout</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.FIELDLAYOUT )) == null ? '' : __t) +
'">\n  <option value="one-column">One Column</option>\n  <option value="two-columns">Two Columns</option>\n  <option value="three-columns">Three Columns</option>\n  <option value="side-by-side">Side by Side</option>\n</select>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/integer_only"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Integer only</div>\n<label>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INTEGER_ONLY )) == null ? '' : __t) +
'\' />\n  Only accept integers\n</label>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/label_description"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<input type=\'text\' data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.LABEL )) == null ? '' : __t) +
'\' />\n<textarea data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.DESCRIPTION )) == null ? '' : __t) +
'\'\n  placeholder=\'Add a longer description to this field\'></textarea>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/likert"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Statements</div>\n\n<div class=\'statement\' data-rv-each-option=\'model.' +
((__t = ( Formbuilder.options.mappings.STATEMENTS )) == null ? '' : __t) +
'\'>\n  <input type="text" data-rv-input="option:label" class=\'option-label-input\' />\n  <a class="js-add-statement ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Add Option"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-remove-statement ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Remove statement"><i class=\'fa fa-minus-circle\'></i></a>\n</div>\n\n<div class=\'fb-bottom-add\'>\n  <a class="js-add-statement ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">Add Statement</a>\n</div>\n\n<div class=\'fb-edit-section-header\'>Columns</div>\n\n' +
((__t = ( Formbuilder.templates['edit/options_generator']() )) == null ? '' : __t) +
'\n\n<br />\n<label>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INCLUDE_NA )) == null ? '' : __t) +
'\' />\n    Include Not Applicable\n </label>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/min_max"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Minimum / Maximum</div>\n\nAbove\n<input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.MIN )) == null ? '' : __t) +
'" style="width: 30px" />\n\n&nbsp;&nbsp;\n\nBelow\n<input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.MAX )) == null ? '' : __t) +
'" style="width: 30px" />\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/min_max_length"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Length Limit</div>\n\nMin\n<input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.MINLENGTH )) == null ? '' : __t) +
'" style="width: 30px" />\n\n&nbsp;&nbsp;\n\nMax\n<input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.MAXLENGTH )) == null ? '' : __t) +
'" style="width: 30px" />\n\n&nbsp;&nbsp;\n\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.LENGTH_UNITS )) == null ? '' : __t) +
'" style="width: auto;">\n  <option value="characters">characters</option>\n  <option value="words">words</option>\n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/name_format"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Name Format</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.NAME_FORMAT )) == null ? '' : __t) +
'">\n  <option value="normal">Normal</option>\n  <option value="extended">Extended</option>\n</select>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/options"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Options</div>\n\n' +
((__t = ( Formbuilder.templates['edit/options_generator']() )) == null ? '' : __t);

}
return __p
};

this["Formbuilder"]["templates"]["edit/options_generator"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if (typeof includeBlank !== 'undefined'){ ;
__p += '\n  <label>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INCLUDE_BLANK )) == null ? '' : __t) +
'\' />\n    Include blank\n  </label>\n';
 } ;
__p += '\n\n<div class=\'option\' data-rv-each-option=\'model.' +
((__t = ( Formbuilder.options.mappings.OPTIONS )) == null ? '' : __t) +
'\'>\n  <input type="checkbox" class=\'js-default-updated\' data-rv-checked="option:checked" />\n  <input type="text" data-rv-input="option:label" class=\'option-label-input\' />\n  <a class="js-add-option ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Add Option"><i class=\'fa fa-plus-circle\'></i></a>\n\n  ';
 if (typeof notIncludeRemove === 'undefined'){ ;
__p += '\n  <a class="js-remove-option ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Remove Option"><i class=\'fa fa-minus-circle\'></i></a>\n  ';
};
__p += '\n</div>\n\n';
 if (typeof includeOther !== 'undefined'){ ;
__p += '\n  <label>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INCLUDE_OTHER )) == null ? '' : __t) +
'\' />\n    Include "other"\n  </label>\n';
 } ;
__p += '\n\n<div class=\'fb-bottom-add\'>\n  <a class="js-add-option ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">Add option</a>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/phone_format"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Phone Format</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.PHONE_FORMAT )) == null ? '' : __t) +
'">\n  <option value="local">### ### ####</option>\n  <option value="international">International</option>  \n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/predefined_date"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Predefined Date</div>\n<input type="text" class="date-blocks" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.PREDEFINED_DATE_FIRST )) == null ? '' : __t) +
'" />\n<span> / </span>\n<input type="text" class="date-blocks" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.PREDEFINED_DATE_SECOND )) == null ? '' : __t) +
'" />\n<span> / </span>\n<input type="text" class="date-blocks" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.PREDEFINED_DATE_YEAR )) == null ? '' : __t) +
'" />\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/predefined_value"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Predefined Value</div>\n<input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.PREDEFINED_VALUE )) == null ? '' : __t) +
'" />\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/size"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Size</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.SIZE )) == null ? '' : __t) +
'">\n  <option value="small">Small</option>\n  <option value="medium">Medium</option>\n  <option value="large">Large</option>\n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/time_format"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Time Format</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.TIME_FORMAT )) == null ? '' : __t) +
'">\n  <option value="12">12 hours</option>\n  <option value="24">24 hours</option>  \n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/units"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Units</div>\n<input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.UNITS )) == null ? '' : __t) +
'" />\n';

}
return __p
};

this["Formbuilder"]["templates"]["form_config/form_setting"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Form Name</div>\n\t\n<input type =\'text\' data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.FORM_NAME )) == null ? '' : __t) +
'\' />\n\n<div class=\'fb-edit-section-header\'>Description</div>\n\n<textarea data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.FORM_DESCRIPTION )) == null ? '' : __t) +
'\' class="fb-description"></textarea>\n\n<div class=\'fb-edit-section-header\'>Label Placement</div>\n\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.FORM_LABEL_PLACEMENT )) == null ? '' : __t) +
'">\n\t<option value="topAligned">Top Aligned</option>\n\t<option value="leftAligned">Left Aligned</option>\n\t<option value="rightAligned">Right Aligned</option>\n</select>\n\n\n<div class=\'fb-edit-section-header\'>Confirmation Options</div>\n<div>\n\t<div>\n\t\t<input type="radio" value="Show Text" name="confirmation-options" data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.FORM_CONFIRMATION_OPTION )) == null ? '' : __t) +
'\' />Show Text\n\t\t<input type="radio" value="Redirect to Website" name="confirmation-options" data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.FORM_CONFIRMATION_OPTION )) == null ? '' : __t) +
'\' />Redirect to Website\n\t</div>\n\t<br />\n\t<div>\n\t\t<textarea data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.FORM_CONFIRMATION_DESCRIPTION )) == null ? '' : __t) +
'\'\n\t  placeholder=\'Add confirmation message here\'></textarea>\n  \t</div>\n  \t<br />\n\t<label>\n\t\t<input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.FORM_SEND_CONFIRMATION_EMAIL )) == null ? '' : __t) +
'\' />\n\t\tSend Confirmation Email to User\n\t</label>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["page"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.templates['partials/save_button']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.templates['partials/left_side']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.templates['partials/right_side']() )) == null ? '' : __t) +
'\n<div class=\'fb-clear\'></div>';

}
return __p
};

this["Formbuilder"]["templates"]["partials/add_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-tab-pane active\' id=\'addField\'>\n  <div class=\'fb-add-field-types\'>\n    <div class=\'section\'>\n      ';
 _.each(_.sortBy(Formbuilder.inputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div>\n\n    <div class=\'section\'>\n      ';
 _.each(_.sortBy(Formbuilder.nonInputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div>\n  </div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/edit_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'editField\'>\n  <div class=\'fb-edit-field-wrapper\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/form_settings"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'formSettings\'>\n  <div class=\'fb-form-settings-wrapper\'>  \t\n  \t\t\n  </div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/left_side"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-left\'>\n  <ul class=\'fb-tabs\'>\n    <li class=\'active\'><a data-target=\'#addField\'>Add new field</a></li>\n    <li><a data-target=\'#editField\'>Edit field</a></li>\n    <li><a data-target=\'#formSettings\'>Form Settings</a></li>\n  </ul>\n\n  <div class=\'fb-tab-content\'>\n    ' +
((__t = ( Formbuilder.templates['partials/add_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Formbuilder.templates['partials/edit_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Formbuilder.templates['partials/form_settings']() )) == null ? '' : __t) +
'\n  </div>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["partials/right_side"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-right\'>\n\t<div class=\'fb-no-response-fields\'>No response fields</div>\n\t<div class=\'fb-response-fields\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/save_button"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-save-wrapper\'>\n  <!-- <button class=\'js-save-form ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'\'></button> -->\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["view/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'subtemplate-wrapper\'>\n  <div class=\'cover\'></div>\n  ' +
((__t = ( Formbuilder.templates['view/label']({rf: rf}) )) == null ? '' : __t) +
'\n\n  ' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].view({rf: rf}) )) == null ? '' : __t) +
'\n\n  ' +
((__t = ( Formbuilder.templates['view/description']({rf: rf}) )) == null ? '' : __t) +
'\n  ' +
((__t = ( Formbuilder.templates['view/duplicate_remove']({rf: rf}) )) == null ? '' : __t) +
'\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["view/base_input_form_settings"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].view({rf: rf}) )) == null ? '' : __t);

}
return __p
};

this["Formbuilder"]["templates"]["view/base_non_input"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'subtemplate-wrapper\'>\n  <div class=\'cover\'></div>\n  ' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].view({rf: rf}) )) == null ? '' : __t) +
'\n  ' +
((__t = ( Formbuilder.templates['view/duplicate_remove']({rf: rf}) )) == null ? '' : __t) +
'\n  \n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["view/description"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span class=\'help-block\'>\n  ' +
((__t = ( Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.DESCRIPTION)) )) == null ? '' : __t) +
'\n</span>\n';

}
return __p
};

this["Formbuilder"]["templates"]["view/duplicate_remove"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'actions-wrapper\'>\n  <a class="js-duplicate ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Duplicate Field"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-clear ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Remove Field"><i class=\'fa fa-minus-circle\'></i></a>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["view/label"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<label class= \'' +
((__t = (  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) )) == null ? '' : __t) +
'\'>\n  <span>' +
((__t = ( Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.LABEL)) )) == null ? '' : __t) +
'\n  ';
 if (rf.get(Formbuilder.options.mappings.REQUIRED)) { ;
__p += '\n    <abbr title=\'required\'>*</abbr>\n  ';
 } ;
__p += '\n</label>\n';

}
return __p
};