Formbuilder.registerField 'price',

  order: 45

  view: """
    <div class='input-line <%=  Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.FORM_LABEL_PLACEMENT)) %>'>
      <span class='above-line'>
      <% currency = "Dollar" %>
      <% if(newCurrency = rf.get(Formbuilder.options.mappings.CURRENCY)){currency = newCurrency} %>
      <%= currency %>
      </span>
      <span class='dolars'>
        <input type='text' />
      </span>
      <span class='above-line'>.</span>
      <span class='cents'>
        <input type='text' />
      </span>
    </div>
  """


  edit: """
    <%= Formbuilder.templates['edit/currency']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-usd"></span></span> Price
  """
