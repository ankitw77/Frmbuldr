Formbuilder.registerField 'email',

  order: 40

  view: """
    <input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' value='<%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %>'/>
  """

  edit: """
   <%= Formbuilder.templates['edit/predefined_value']() %>
   <%= Formbuilder.templates['edit/size']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-envelope-o"></span></span> Email
  """
