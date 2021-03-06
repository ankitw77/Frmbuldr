Formbuilder.registerField 'paragraph',

  order: 5

  view: """
    <textarea class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>'><%= rf.get(Formbuilder.options.mappings.PREDEFINED_VALUE) %></textarea>
  """

  edit: """
    <%= Formbuilder.templates['edit/predefined_value']() %>
    <%= Formbuilder.templates['edit/size']() %>
    <%= Formbuilder.templates['edit/min_max_length']() %>
  """

  addButton: """
    <span class="symbol">&#182;</span> Paragraph
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.size = 'small'
    attrs
