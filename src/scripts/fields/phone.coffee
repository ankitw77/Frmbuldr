Formbuilder.registerField 'phone',

  order: 55

  view: """
   <div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>
    <% if(rf.get(Formbuilder.options.mappings.PHONE_FORMAT) === "international") {%>
      <span class='international'>
        <input type="text" />
      </span>
    <% } %>
    <% if(rf.get(Formbuilder.options.mappings.PHONE_FORMAT) === "local"){ %>    
      <span class='first_part'>
        <input type="text" />
        <label>###</label>
      </span>

      <span class='above-line'>-</span>

      <span class='second_part'>
        <input type="text" />
        <label>###</label>
      </span>

      <span class='above-line'>-</span>

      <span class='third_part'>
        <input type="text" />
        <label>#####</label>
      </span>
    <% } %>
      
    </div>
  """

  edit: """
    <%= Formbuilder.templates['edit/phone_format']()%>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-phone"></span></span> Phone
  """

  defaultAttributes: (attrs) ->
    # @todo
    attrs.field_options.phone_format = "local"
    attrs

