Formbuilder.registerField 'website',

  order: 35

  view: """
    <input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' placeholder='http://' value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %>' />
  """

  edit: """
 	 <%= Formbuilder.templates['edit/predefined_value']() %>
 	 <%= Formbuilder.templates['edit/size']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-link"></span></span> Website
  """
