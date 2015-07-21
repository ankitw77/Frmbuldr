Formbuilder.registerField 'radio',

  order: 15

  view: """
    <% field_layout_value = rf.get(Formbuilder.options.mappings.FIELDLAYOUT) %>
    <% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>
      <div class = '<%= field_layout_value %> multichoice <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>
        <label class='fb-option'>
          <input type='radio' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick="javascript: return false;" />
          <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>
        </label>
      </div>
    <% } %>

  """

  edit: """
    <%= Formbuilder.templates['edit/field_layout']()%>
    <%= Formbuilder.templates['edit/options']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-circle-o"></span></span> Multiple Choice
  """

  defaultAttributes: (attrs) ->
    # @todo
    attrs.field_options.options = [
      label: "",
      checked: false
    ,
      label: "",
      checked: false
    ]

    attrs