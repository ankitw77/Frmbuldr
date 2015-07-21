Formbuilder.registerField 'likert',

  order: 51

  view: """

  <table class="likert">
    <tr class="header">
    <td></td>
    <% for (j in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>
      <th>
           <label class='fb-option'> <%= rf.get(Formbuilder.options.mappings.OPTIONS)[j].label %> </label>
      </th>
    <% } %>

    <% if(rf.get(Formbuilder.options.mappings.INCLUDE_NA)) {%>
    <th>
       <label class='fb-option'> N/A </label>
    </th>
    <% } %>
    <tr/ >

    <% for (i in (rf.get(Formbuilder.options.mappings.STATEMENTS) || [])) { %>
      <tr>
        <td>
          <label class='fb-option'> <%= rf.get(Formbuilder.options.mappings.STATEMENTS)[i].label %></label>
        </td>

        <% for (j in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>
        <td>
          <input type="radio" <%= rf.get(Formbuilder.options.mappings.OPTIONS)[j].checked && 'checked' %> />
        </td>
        <% } %>

        <% if(rf.get(Formbuilder.options.mappings.INCLUDE_NA)) {%>
        <td>
          <input type="radio" />
        </td>
        <% } %>
      </tr>

    <% } %>

  </table>
  
  """

  edit: """
    <%= Formbuilder.templates['edit/likert']()%>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-table"></span></span> Likert
  """

  defaultAttributes: (attrs) ->
    # @todo
    attrs.field_options.options = [
      label: "Column 1",
      checked: false
    ,
      label: "Column 2",
      checked: false
    ]

    attrs.field_options.statements = [
      label: "Statement 1",
      checked: false
    ,
      label: "Statement 2",
      checked: false
    ]

    attrs
