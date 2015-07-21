Formbuilder.registerField 'date',

  order: 20

  view: """
    <div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>
      <% if(rf.get(Formbuilder.options.mappings.DATE_FORMAT) == 'MM/DD/YYYY'){ %>
      <span class='month'>
        <input type="text" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_FIRST) %>' />
        <label>MM</label>
      </span>

      <span class='above-line'>/</span>

      <span class='day'>
        <input type="text" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_SECOND) %>' />
        <label>DD</label>
      </span>
      <% } %>

      <% if(rf.get(Formbuilder.options.mappings.DATE_FORMAT) == 'DD/MM/YYYY'){ %>
      <span class='day'>
        <input type="text" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_FIRST) %>' />
        <label>DD</label>
      </span>

      <span class='above-line'>/</span>

       <span class='month'>
        <input type="text" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_SECOND) %>' />
        <label>MM</label>
      </span>
      <% } %>

      <span class='above-line'>/</span>

      <span class='year'>
        <input type="text" value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_DATE_YEAR) %>' />
        <label>YYYY</label>
      </span>
    </div>
  """

  edit: """
     <%= Formbuilder.templates['edit/date_format']()%>
     <%= Formbuilder.templates['edit/predefined_date']()%>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-calendar"></span></span> Date
  """

  defaultAttributes: (attrs) ->
    # @todo
    attrs.field_options.date_format = "MM/DD/YYYY"
    attrs

