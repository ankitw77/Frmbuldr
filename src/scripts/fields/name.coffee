Formbuilder.registerField 'name',

  order: 52

  view: """
    <div class='input-line'>

      <% if(rf.get(Formbuilder.options.mappings.NAME_FORMAT) == 'extended'){ %>
      <span class='title'>
        <input type='text' />
        <label>Title</label>
      </span>
      &nbsp;&nbsp;&nbsp;
      <% } %>

      <span class='first'>
        <input type='text' />
        <label>First</label>
      </span>
      &nbsp;&nbsp;&nbsp;

      <span class='last'>
        <input type='text' />
        <label>Last</label>
      </span>
      &nbsp;&nbsp;&nbsp;

      <% if(rf.get(Formbuilder.options.mappings.NAME_FORMAT) == 'extended'){ %>
      <span class='suffix'>
        <input type='text' />
        <label>Suffix</label>
      </span>
      &nbsp;&nbsp;&nbsp;
       <% } %>
    </div>
  """


  edit: """
   <%= Formbuilder.templates['edit/name_format']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-newspaper-o"></span></span> Name
  """
