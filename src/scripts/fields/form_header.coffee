Formbuilder.registerField 'form_header',

  order: 5

  type: 'input_form_settings'

  view: """
  	<div class="form-header">
		<label class = "form-name">
			<span>
				<% if(typeof rf !== "undefined"){ %>
				<%= rf.get(Formbuilder.options.mappings.FORM_NAME)%>
				<% } %>
			</span>
		</label>
		<br />
		<label class = "form-description">
			<span>
				<% if(typeof rf !== "undefined"){ %>
				<%= rf.get(Formbuilder.options.mappings.FORM_DESCRIPTION)%>
				<% } %>
			</span>
		</label>

	</div>
  """

  edit: """   
  """

  defaultAttributes: (attrs) ->
    # @todo
    attrs.field_options.form_name = "Untitled"
    attrs.field_options.form_description = "Description"
    attrs